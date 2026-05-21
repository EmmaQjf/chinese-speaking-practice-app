import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { assertClassAccess } from "@/lib/assertClassAccess";
import connectDB from "@/lib/mongodb";
import { isScenarioLevel } from "@/lib/scenarioLevels";
import { isTopicId } from "@/lib/topics";
import Scenario from "@/models/Scenario";

type RouteContext = { params: Promise<{ id: string }> };
//Zod validates incoming requests, Before DB access Before business logic Before side effects
// Zod answers:

// ✔ Is it the right type?
// ✔ Is it trimmed?
// ✔ Is it empty?
// ✔ Is it one of the allowed values?
// ✔ Is it too long?
const createScenarioSchema = z.object({
  topicId: z
    .string()
    .trim()
    //.refine() runs at runtime to enforce rules that TypeScript types cannot enforce once the app is running.
    .refine(isTopicId, { message: "Invalid topic" }),
  level: z
    .string()
    .trim()
    .refine(isScenarioLevel, { message: "Invalid level" }),
  promptEnglish: z
    .string()
    .trim()
    .min(1, "Prompt is required")
    .max(2000, "Prompt must be at most 2000 characters"),
});

/**
 * Phase 3 Step 3.3: teacher-only create scenario in a class.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: "You must be signed in." }, { status: 401 });
    }
    //It verifies that session.user.id is a valid MongoDB ObjectId string.
    if (!Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ ok: false, message: "Invalid session." }, { status: 401 });
    }
  //Extracts the id parameter from the URL Renames it to classId
    const { id: classId } = await context.params;
    const body: unknown = await request.json();
    //Validate with Zod (runtime schema validation)
    const parsed = createScenarioSchema.safeParse(body);
//     Checks the object at runtime
// Ensures:
// required fields exist
// correct types
// trimming rules
// .min(), .max()
// .refine(...) rules
// Returns:

// {
//   success: true,
//   data: ValidatedData
// }
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Invalid form data", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const access = await assertClassAccess(session.user.id, session.user.role, classId);
    if (!access.ok) {
      return NextResponse.json(
        { ok: false, message: access.message },
        { status: access.status }
      );
    }
    if (access.roleInClass !== "teacher") {
      return NextResponse.json(
        { ok: false, message: "Only teachers can create scenarios for this class." },
        { status: 403 }
      );
    }

    const created = await Scenario.create({
      classId: new Types.ObjectId(classId),
      topicId: parsed.data.topicId,
      level: parsed.data.level,
      promptEnglish: parsed.data.promptEnglish,
      createdBy: new Types.ObjectId(session.user.id),
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Scenario created.",
        scenario: {
          id: created._id.toString(),
          classId,
          topicId: created.topicId,
          level: created.level,
          promptEnglish: created.promptEnglish,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("MONGODB_URI")) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 503 });
    }
    console.error("POST /api/classes/[id]/scenarios", error);
    return NextResponse.json({ ok: false, message: "Server error. Try again later." }, { status: 500 });
  }
}


// Browser (untrusted)
//    ↓
// Zod (API validation)
//    ↓
// TypeScript (developer safety)
//    ↓
// Mongoose (database safety)
//    ↓
// MongoDB