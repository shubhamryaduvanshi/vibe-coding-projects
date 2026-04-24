import { Schema, Types, model, type HydratedDocument } from "mongoose";

export interface AssignmentHistory {
  taskId: Types.ObjectId;
  oldAssignee: Types.ObjectId | null;
  newAssignee: Types.ObjectId | null;
  changedBy: Types.ObjectId;
  timestamp: Date;
}

const assignmentHistorySchema = new Schema<AssignmentHistory>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    oldAssignee: { type: Schema.Types.ObjectId, ref: "User", default: null },
    newAssignee: { type: Schema.Types.ObjectId, ref: "User", default: null },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: () => new Date(), index: true }
  },
  { versionKey: false }
);

assignmentHistorySchema.index({ taskId: 1, timestamp: -1 });

export const AssignmentHistoryModel = model<AssignmentHistory>(
  "AssignmentHistory",
  assignmentHistorySchema,
  "assignment_histories"
);
export type AssignmentHistoryDocument = HydratedDocument<AssignmentHistory>;

