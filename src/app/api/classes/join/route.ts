import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Class from "@/models/Class";
import ClassMembership from "@/models/ClassMembership";

const joinSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Join code is required")
    .transform((s) => s.toUpperCase()),
});

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}

/**
 * Phase 2 Step 2.5: student joins a class by join code (lookup class, then membership).
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: "You must be signed in." }, { status: 401 });
    }
    if (session.user.role !== "student") {
      return NextResponse.json(
        { ok: false, message: "Only students can join a class with a code." },
        { status: 403 }// not authorized 
      );
    }
    //Types.ObjectId.isValid(value)-- “Is this value a valid MongoDB ObjectId format?”
    if (!Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ ok: false, message: "Invalid session." }, { status: 401 });
      //The request reached the server, but👉 you are not authenticated.
    }

    const body: unknown = await request.json();
    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid form data", errors: parsed.error.flatten() },
        { status: 400 } //bad request
      );
    }

    await connectDB();
  //?
    const userId = new Types.ObjectId(session.user.id);
//     Converts session.user.id (string) → MongoDB ObjectId
// Necessary because MongoDB stores _id as ObjectId, not strings
    const joinCode = parsed.data.code;
  // deal with wrong join id 
    const classDoc = await Class.findOne({ joinCode }).lean();
    //lean() So instead of getting a Mongoose Document, you get a plain JavaScript object
    if (!classDoc) {
      return NextResponse.json(
        { ok: false, message: "No class found with that join code." },
        { status: 404 } //not found 
      );
    }
  // whether this student has already joined the class 
    const classId = classDoc._id as Types.ObjectId;

    const existing = await ClassMembership.findOne({ classId, userId }).lean();
    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadyMember: true,
        message: "You're already in this class.",
        class: {
          id: String(classDoc._id),
          name: classDoc.name,
        },
      });
    }

    try {
      await ClassMembership.create({
        classId,
        userId,
        roleInClass: "student",
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return NextResponse.json({
          ok: true,
          alreadyMember: true,
          message: "You're already in this class.",
          class: {
            id: String(classDoc._id),
            name: classDoc.name,
          },
        });
      }
      throw error;
    }

    return NextResponse.json(
      {
        ok: true,
        alreadyMember: false,
        message: "You joined the class.",
        class: {
          id: String(classDoc._id),
          name: classDoc.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("MONGODB_URI")) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 503 });
    }
    console.error("POST /api/classes/join", error);
    return NextResponse.json({ ok: false, message: "Server error. Try again later." }, { status: 500 });
  }
}
