import {
  Schema,//Used to define the structure of data
  model, //Creates a database model
  models,//Holds already-created models
  type Document, //Base type for MongoDB documents
  type Model, //Type for a Mongoose model
  type Types, //MongoDB types (like ObjectId)
} from "mongoose";

//“A Class document will have these fields.”
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
      type: Schema.Types.ObjectId,//ObjectId allows relational-like references.
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Class: Model<ClassDoc> = models.Class ?? model<ClassDoc>("Class", classSchema);
export default Class;
