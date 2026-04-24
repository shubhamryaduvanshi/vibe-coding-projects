import { AssignmentHistoryModel } from "../models/assignment-history.model.js";

export class AssignmentHistoryRepository {
  create(data: {
    taskId: string;
    oldAssignee: string | null;
    newAssignee: string | null;
    changedBy: string;
  }) {
    return AssignmentHistoryModel.create(data);
  }

  listByTask(taskId: string) {
    return AssignmentHistoryModel.find({ taskId })
      .populate("oldAssignee")
      .populate("newAssignee")
      .populate("changedBy")
      .sort({ timestamp: -1 });
  }
}

