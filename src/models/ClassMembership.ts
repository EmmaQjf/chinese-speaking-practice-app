import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export type ClassMembershipRole = "teacher" | "student";

export interface ClassMembershipDoc extends Document {
  classId: Types.ObjectId;
  userId: Types.ObjectId;
  roleInClass: ClassMembershipRole;
}

const classMembershipSchema = new Schema<ClassMembershipDoc>(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roleInClass: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
    },
  },
  { timestamps: true }
);

classMembershipSchema.index({ classId: 1, userId: 1 }, { unique: true });

const ClassMembership: Model<ClassMembershipDoc> =
  models.ClassMembership ?? model<ClassMembershipDoc>("ClassMembership", classMembershipSchema);

export default ClassMembership;
