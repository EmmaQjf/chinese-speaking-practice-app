import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  type Types,
} from "mongoose";

export interface ClassDoc extends Document {
  name: string;
  joinCode: string;
  teacherId: Types.ObjectId;
}

const classSchema = new Schema<ClassDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    joinCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 4,
      maxlength: 16,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Class: Model<ClassDoc> = models.Class ?? model<ClassDoc>("Class", classSchema);
export default Class;
