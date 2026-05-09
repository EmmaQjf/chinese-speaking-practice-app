import { Schema, model, models, type Document, type Model } from "mongoose";

export type UserRole = "teacher" | "student";
//UserDoc (TypeScript interface) 
export interface UserDoc extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
}

const userSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["teacher", "student"], required: true },
  },
  { timestamps: true }
);

//model<...> = "make new table"
//models.User = Mongoose's memory of existing tables
const User: Model<UserDoc> = models.User ?? model<UserDoc>("User", userSchema);
export default User;
