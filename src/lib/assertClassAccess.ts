
//Given a user and a class, decide whether the user is allowed to access the class, and if yes, what role they have in it.

import { Types } from "mongoose";
import Class from "@/models/Class";
import ClassMembership from "@/models/ClassMembership";
import type { ClassMembershipRole } from "@/models/ClassMembership";
import type { UserRole } from "@/models/User";

export type ClassAccessDoc = {
  _id: Types.ObjectId;
  name: string;
  joinCode: string;
  teacherId: Types.ObjectId;
};

export type AssertClassAccessResult =
  | { ok: true; class: ClassAccessDoc; roleInClass: ClassMembershipRole }
  | { ok: false; status: 404 | 403; message: string };

/**
 * Phase 2 Step 2.9: ensure the user may access this class (owner or membership).
 * Caller must call connectDB() first.
 */
export async function assertClassAccess(
  userId: string,
  _accountRole: UserRole,
  classId: string
): Promise<AssertClassAccessResult> {
  //Validate IDs (fail fast)
  if (!Types.ObjectId.isValid(classId) || !Types.ObjectId.isValid(userId)) {
    return { ok: false, status: 404, message: "Class not found." };
  }
  //Convert strings → ObjectIds
  const classOid = new Types.ObjectId(classId);
  const userOid = new Types.ObjectId(userId);
  //.lean() → plain JS object (faster, no Mongoose magic)<ClassAccessDoc> → typed result
  const classDoc = await Class.findById(classOid).lean<ClassAccessDoc>();
  if (!classDoc) {
    return { ok: false, status: 404, message: "Class not found." };
  }
  
  // Why .equals()?
  // ObjectId === ObjectId ❌
  // ObjectId.equals(ObjectId) ✅
  //Is the user the teacher?
  if (classDoc.teacherId.equals(userOid)) {
    return { ok: true, class: classDoc, roleInClass: "teacher" };
  }
  //Check membership
  const membership = await ClassMembership.findOne({
    classId: classOid,
    userId: userOid,
  }).lean();

  if (membership) {
    return { ok: true, class: classDoc, roleInClass: membership.roleInClass };
  }
  //Deny access
  return {
    ok: false,
    status: 403,
    message: "You do not have access to this class.",
  };
}

// Why 403 (not 404)?
// Class exists
// User is real
// Permission denied

// Validate IDs
//    ↓
// Find class
//    ↓
// Is teacher?
//    ↓
// Is member?
//    ↓
// Deny access
