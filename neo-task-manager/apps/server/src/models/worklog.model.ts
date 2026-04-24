import { Schema, Types, model, type HydratedDocument } from "mongoose";

export interface Worklog {
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  hours: number;
  description: string;
  createdAt: Date;
}

const worklogSchema = new Schema<Worklog>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hours: { type: Number, required: true, min: 0.1 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: () => new Date() }
  },
  { versionKey: false, timestamps: false }
);

worklogSchema.index({ taskId: 1, createdAt: -1 });

export const WorklogModel = model<Worklog>("Worklog", worklogSchema, "worklogs");
export type WorklogDocument = HydratedDocument<Worklog>;

