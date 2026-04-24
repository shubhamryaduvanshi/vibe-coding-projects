import { StatusCodes } from "http-status-codes";
import { AssignmentHistoryRepository } from "../repositories/assignment-history.repository.js";
import { TaskRepository } from "../repositories/task.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import { toAssignmentHistory, toTask } from "../utils/mappers.js";
import { socketService } from "./socket.service.js";

export class AssignmentService {
  constructor(
    private readonly assignmentHistoryRepository: AssignmentHistoryRepository,
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository
  ) {}

  async assignTask(input: {
    taskId: string;
    assigneeId: string | null;
    changedBy: string;
  }) {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    if (input.assigneeId) {
      const assignee = await this.userRepository.findById(input.assigneeId);
      if (!assignee) {
        throw new AppError("Assignee not found", StatusCodes.NOT_FOUND);
      }
    }

    const previousAssignee = task.assignee
      ? typeof task.assignee === "object" && "id" in (task.assignee as object)
        ? ((task.assignee as unknown as { id: string }).id ?? null)
        : String(task.assignee)
      : null;
    const updatedTask = await this.taskRepository.updateTask(input.taskId, {
      assignee: input.assigneeId
    });

    if (!updatedTask) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    await this.assignmentHistoryRepository.create({
      taskId: input.taskId,
      oldAssignee: previousAssignee,
      newAssignee: input.assigneeId,
      changedBy: input.changedBy
    });

    const history = await this.assignmentHistoryRepository.listByTask(input.taskId);
    const mappedTask = toTask(updatedTask);
    const mappedHistory = history.map(toAssignmentHistory);

    socketService.emitBoardUpdated({ type: "assignment_updated", task: mappedTask });
    socketService.emitTaskDetailsUpdated(input.taskId, {
      task: mappedTask,
      assignmentHistory: mappedHistory
    });

    return {
      task: mappedTask,
      assignmentHistory: mappedHistory
    };
  }

  async listTaskHistory(taskId: string) {
    const entries = await this.assignmentHistoryRepository.listByTask(taskId);
    return entries.map(toAssignmentHistory);
  }
}
