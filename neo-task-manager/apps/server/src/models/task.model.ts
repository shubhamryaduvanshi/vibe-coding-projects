import { Schema, Types, model, type HydratedDocument } from "mongoose";
import { TASK_STATUSES, type TaskStatus } from "@neo/types";

export interface Task {
  title: string;
  description: string;
  status: TaskStatus;
  assignee: Types.ObjectId | null;
  dueDate: Date | null;
  createdBy: Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<Task>(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, default: "" },
    status: { type: String, enum: TASK_STATUSES, default: "Backlog", index: true },
    assignee: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    dueDate: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    position: { type: Number, required: true, default: 0, index: true }
  },
  { timestamps: true, versionKey: false }
);

taskSchema.index({ status: 1, position: 1 });

export const TaskModel = model<Task>("Task", taskSchema, "tasks");
export type TaskDocument = HydratedDocument<Task>;

