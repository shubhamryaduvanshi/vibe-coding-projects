import { StatusCodes } from "http-status-codes";
import { TaskRepository } from "../repositories/task.repository.js";
import { WorklogRepository } from "../repositories/worklog.repository.js";
import { AppError } from "../utils/app-error.js";
import { toWorklog } from "../utils/mappers.js";
import { socketService } from "./socket.service.js";

export class WorklogService {
  constructor(
    private readonly worklogRepository: WorklogRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async addWorklog(input: {
    taskId: string;
    userId: string;
    hours: number;
    description: string;
  }) {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    await this.worklogRepository.create(input);
    const worklogs = await this.worklogRepository.listByTask(input.taskId);
    const mappedWorklogs = worklogs.map(toWorklog);

    socketService.emitTaskDetailsUpdated(input.taskId, { worklogs: mappedWorklogs });
    return { worklogs: mappedWorklogs };
  }

  async listTaskWorklogs(taskId: string) {
    const worklogs = await this.worklogRepository.listByTask(taskId);
    return worklogs.map(toWorklog);
  }
}

