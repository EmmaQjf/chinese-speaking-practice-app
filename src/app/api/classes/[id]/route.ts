//“When someone asks for a class, check who they are, check if they are allowed to see it, then return the class data safely.”
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";//find out who is logged in
import { authOptions } from "@/lib/authOptions"; //rules for login system
import { assertClassAccess } from "@/lib/assertClassAccess";
import connectDB from "@/lib/mongodb";

//“This page URL includes a class ID.”
type RouteContext = { params: Promise<{ id: string }> };

/**
 * Phase 2 Step 2.9: class detail for members only (teacher owner or ClassMembership).
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    //Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: "You must be signed in." }, { status: 401 });
    }
    //Get class ID from URL
    const { id } = await context.params;
    await connectDB();
    //Check permission (VERY important) “Is this user allowed to view this class?”
    const access = await assertClassAccess(session.user.id, session.user.role, id);
    if (!access.ok) {
      return NextResponse.json(
        { ok: false, message: access.message },
        { status: access.status }
      );
    }
   //Extract class data
    const { class: classDoc, roleInClass } = access;
    return NextResponse.json({
      ok: true,
      class: {
        id: String(classDoc._id),
        name: classDoc.name,
        joinCode: roleInClass === "teacher" ? classDoc.joinCode : undefined,
        roleInClass,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("MONGODB_URI")) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 503 });
    }
    console.error("GET /api/classes/[id]", error);
    return NextResponse.json({ ok: false, message: "Server error. Try again later." }, { status: 500 });
  }
}
