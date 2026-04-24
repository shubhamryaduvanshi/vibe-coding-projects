import { WorklogModel } from "../models/worklog.model.js";

export class WorklogRepository {
  create(data: { taskId: string; userId: string; hours: number; description: string }) {
    return WorklogModel.create(data);
  }

  listByTask(taskId: string) {
    return WorklogModel.find({ taskId }).populate("userId").sort({ createdAt: -1 });
  }

  async aggregateTimeReport() {
    return WorklogModel.aggregate<{
      _id: string;
      totalHours: number;
    }>([
      {
        $group: {
          _id: "$taskId",
          totalHours: { $sum: "$hours" }
        }
      }
    ]);
  }
}

