import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";//getServerSession lets your server check who is currently logged in.
import { Types } from "mongoose";
// Your App (JS/TS)
//      ↓
//   Mongoose
//      ↓
//   MongoDB

// Your app:

// Never talks to MongoDB directly
// Talks to Mongoose instead

// Mongoose:

// Translates JS objects ↔ MongoDB documents
// Enforces schemas
// Handles ObjectIds
// Adds safety + convenience
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Class from "@/models/Class";
import ClassMembership from "@/models/ClassMembership";

const createClassSchema = z.object({
  name: z.string().trim().min(1, "Class name is required").max(120),
});

const JOIN_CODE_LENGTH = 8;
/** Uppercase; excludes 0, O, 1, I for readability. */
const JOIN_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomJoinCode(): string {
  const bytes = randomBytes(JOIN_CODE_LENGTH);
  let out = "";
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    out += JOIN_CODE_ALPHABET[bytes[i]! % JOIN_CODE_ALPHABET.length]!;
  }
  return out;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}

/**
 * Phase 2 Step 2.7: list classes for the signed-in user (teacher vs student).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: "You must be signed in." }, { status: 401 });
    }
    if (!Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ ok: false, message: "Invalid session." }, { status: 401 });
    }

    await connectDB();

    const userId = new Types.ObjectId(session.user.id);
    // MongoDB creates _id automatically.
    //  Auth turns it into a string.
    //  You convert it back when querying.
    //You need this line to convert the authenticated user’s string ID into a MongoDB ObjectId so database queries work correctly. 
    //when user signs up, _id: ObjectId("665f2c8e2a6d3c9c9b1a1234") is automaticlly created and the type is objectID
    //Internally: MongoDB identifies the user by _id; Relations use _id as foreign keys
    // ClassMembership.create({
    //   userId: user._id,   // ObjectId
    //   classId: class._id, // ObjectId
    // });
    //Auth systems (e.g. NextAuth) do not store ObjectIds in sessions. Instead: Session data is serialized; IDs are stored as strings
    //session.user.id === "665f2c8e2a6d3c9c9b1a1234" // string

    //     DB → ObjectId
    // Session → string
    const role = session.user.role;

    if (role === "teacher") {
      const classes = await Class.find({ teacherId: userId }).sort({ createdAt: -1 }).lean();
      const items = classes.map((c) => ({
        id: String(c._id),
        name: c.name,
        joinCode: c.joinCode,
        role: "teacher" as const,
      }));
      return NextResponse.json({ ok: true, classes: items });
    }

    if (role === "student") {
      const memberships = await ClassMembership.find({ userId }).lean();
      const classIds = memberships.map((m) => m.classId);
      if (classIds.length === 0) {
        return NextResponse.json({ ok: true, classes: [] });
      }
      const classes = await Class.find({ _id: { $in: classIds } }).sort({ createdAt: -1 }).lean();
      //“Given a class ID, what is the user’s role in that class?”
      //A Map is like an advanced object used for lookups.
      // new Map([
      //   ["abc123", "student"],
      //   ["def456", "ta"]
      // ])
      //roleByClassId.get("abc123") // "student"
      const roleByClassId = new Map(
        memberships.map((m) => [String(m.classId), m.roleInClass])
      );
      const items = classes.map((c) => ({
        id: String(c._id),
        name: c.name,
        role: roleByClassId.get(String(c._id)) ?? ("student" as const),
      }));
      return NextResponse.json({ ok: true, classes: items });
    }

    return NextResponse.json({ ok: false, message: "Unsupported role." }, { status: 403 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("MONGODB_URI")) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 503 });
    }
    console.error("GET /api/classes", error) // "student";
    return NextResponse.json({ ok: false, message: "Server error. Try again later." }, { status: 500 });
  }
}

/**
 * Phase 2 Step 2.3: teacher-only create class + unique join code + teacher ClassMembership.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions); //“Who is making this request?” It checks secure cookies on the request
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: "You must be signed in." }, { status: 401 });
    }
    if (session.user.role !== "teacher") {
      return NextResponse.json(
        { ok: false, message: "Only teachers can create a class." },
        { status: 403 }
      );
    }
    //Being logged in proves who you are; this check confirms the ID we’ll use is safe and valid.
    if (!Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ ok: false, message: "Invalid session." }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = createClassSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid form data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const teacherId = new Types.ObjectId(session.user.id);
    const maxAttempts = 15;

    for (let i = 0; i < maxAttempts; i++) {
      const joinCode = randomJoinCode();
      let createdClass;
      try {
        createdClass = await Class.create({
          name: parsed.data.name.trim(),
          joinCode,
          teacherId,
        });
      } catch (error) {
//         The join code is already taken
// This is not a big problem
// Just generate a new code and try again
        if (isDuplicateKeyError(error)) {
          continue;
        }
        throw error;
      }

      try {
        await ClassMembership.create({
          classId: createdClass._id,
          userId: teacherId,
          roleInClass: "teacher",
        });
      } catch (error) {
        await Class.findByIdAndDelete(createdClass._id);
        throw error;
      }

      return NextResponse.json(
        {
          ok: true,
          message: "Class created.",
          class: {
            id: createdClass._id.toString(),
            name: createdClass.name,
            joinCode: createdClass.joinCode,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Could not generate a unique join code. Try again." },
      { status: 503 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("MONGODB_URI")) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 503 });
    }
    console.error("POST /api/classes", error);
    return NextResponse.json({ ok: false, message: "Server error. Try again later." }, { status: 500 });
  }
}
