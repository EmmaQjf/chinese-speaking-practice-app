import { NextResponse } from "next/server";//NextResponse is how you send a response back to the browserUsed in Next.js API routes (server-side)
import bcrypt from "bcryptjs";
import { z } from "zod"; //A data validation library It checks if user input is correct BEFORE using it
import connectDB from "@/lib/mongodb";
import User from "@/models/User"; //This represents your users collection in MongoDB
// Lets you:
// find users
// create users
// update users

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["teacher", "student"]),
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
 * Phase 1 Step 1.4: validate, hash password, save user to MongoDB.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);//Checks if user input matches rules

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid form data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;
    const emailNorm = email.toLowerCase();

    await connectDB();

    const existing = await User.findOne({ email: emailNorm });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "An account with that email already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      email: emailNorm,
      name: name.trim(),
      passwordHash,
      role,
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Account created. You can log in after we wire up login (Step 1.5).",
        userPreview: { name: name.trim(), email: emailNorm, role },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { ok: false, message: "An account with that email already exists." },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes("MONGODB_URI")) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 503 }
      );
    }
    console.error("POST /api/register", error);
    return NextResponse.json({ ok: false, message: "Server error. Try again later." }, { status: 500 });
  }
}
