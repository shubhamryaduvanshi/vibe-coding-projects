import { TaskModel } from "../models/task.model.js";
import type { TaskStatus } from "@neo/types";

export class TaskRepository {
  async create(data: {
    title: string;
    description: string;
    dueDate: Date | null;
    createdBy: string;
    position: number;
  }) {
    return TaskModel.create({
      ...data,
      status: "Backlog",
      assignee: null
    });
  }

  findById(id: string) {
    return TaskModel.findById(id).populate("assignee").populate("createdBy");
  }

  listBoardTasks() {
    return TaskModel.find()
      .populate("assignee")
      .populate("createdBy")
      .sort({ status: 1, position: 1, createdAt: 1 });
  }

  async getNextPosition(status: TaskStatus) {
    const lastTask = await TaskModel.findOne({ status }).sort({ position: -1 });
    return lastTask ? lastTask.position + 1 : 0;
  }

  async updateTask(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      dueDate: Date | null;
      status: TaskStatus;
      assignee: string | null;
      position: number;
    }>
  ) {
    return TaskModel.findByIdAndUpdate(id, updates, { new: true })
      .populate("assignee")
      .populate("createdBy");
  }

  async listByStatus(status: TaskStatus) {
    return TaskModel.find({ status }).sort({ position: 1 });
  }

  async bulkWrite(operations: Parameters<typeof TaskModel.bulkWrite>[0]) {
    await TaskModel.bulkWrite(operations);
  }
}

