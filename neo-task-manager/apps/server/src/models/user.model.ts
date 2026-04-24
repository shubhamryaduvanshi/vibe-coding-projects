import { Schema, model, type HydratedDocument } from "mongoose";

export interface User {
  name: string;
  email: string;
  passwordHash: string;
  refreshTokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    passwordHash: { type: String, required: true },
    refreshTokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true, versionKey: false }
);

export const UserModel = model<User>("User", userSchema, "users");
export type UserDocument = HydratedDocument<User>;

