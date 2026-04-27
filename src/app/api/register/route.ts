import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["teacher", "student"]),
});

/**
 * Phase 1 Step 1.3:
 * Validate request data and return JSON.
 * In Step 1.4 we will save the user in MongoDB.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);
    // check whether the data match the registerSchema 

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid form data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, role } = parsed.data;
    //parsed.data contains clean, typed, validated data
    //NextResponse.json-Converts a JavaScript object to JSON.Sets correct HTTP headers,Returns an HTTP response object
    return NextResponse.json(
      {
        ok: true,
        message: "Validation passed. Database save comes in Step 1.4.",
        userPreview: { name, email: email.toLowerCase(), role },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
