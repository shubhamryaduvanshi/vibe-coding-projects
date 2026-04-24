import { groupTasksByStatus } from "@neo/utils";
import { StatusCodes } from "http-status-codes";
import type { ReorderTaskInput } from "@neo/types";
import { TaskRepository } from "../repositories/task.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/app-error.js";
import { toTask, toUserSummary } from "../utils/mappers.js";
import { socketService } from "./socket.service.js";

export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly userRepository: UserRepository
  ) {}

  async listBoard() {
    const [tasks, users] = await Promise.all([
      this.taskRepository.listBoardTasks(),
      this.userRepository.listAll()
    ]);

    return {
      columns: groupTasksByStatus(tasks.map(toTask)),
      users: users.map(toUserSummary)
    };
  }

  async createTask(input: {
    title: string;
    description: string;
    dueDate: string | null;
    userId: string;
  }) {
    const position = await this.taskRepository.getNextPosition("Backlog");
    const task = await this.taskRepository.create({
      title: input.title,
      description: input.description,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      createdBy: input.userId,
      position
    });

    const fullTask = await this.taskRepository.findById(task.id);
    if (!fullTask) {
      throw new AppError("Task creation failed", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const mappedTask = toTask(fullTask);
    socketService.emitBoardUpdated({ type: "task_created", task: mappedTask });
    return { task: mappedTask };
  }

  async updateTask(
    taskId: string,
    input: { title?: string; description?: string; dueDate?: string | null; status?: string }
  ) {
    const task = await this.taskRepository.updateTask(taskId, {
      title: input.title,
      description: input.description,
      dueDate:
        input.dueDate === undefined ? undefined : input.dueDate ? new Date(input.dueDate) : null,
      status: input.status as never
    });

    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    const mappedTask = toTask(task);
    socketService.emitBoardUpdated({ type: "task_updated", task: mappedTask });
    socketService.emitTaskDetailsUpdated(task.id, { task: mappedTask });
    return { task: mappedTask };
  }

  async getTaskDetails(taskId: string, loaders: {
    loadHistory: (taskId: string) => Promise<unknown>;
    loadWorklogs: (taskId: string) => Promise<unknown>;
  }) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    const [assignmentHistory, worklogs] = await Promise.all([
      loaders.loadHistory(taskId),
      loaders.loadWorklogs(taskId)
    ]);

    return {
      task: toTask(task),
      assignmentHistory,
      worklogs
    };
  }

  async reorder(input: ReorderTaskInput) {
    const sourceTasks = await this.taskRepository.listByStatus(input.sourceStatus);
    const destinationTasks =
      input.sourceStatus === input.destinationStatus
        ? [...sourceTasks]
        : await this.taskRepository.listByStatus(input.destinationStatus);

    const movingTaskIndex = sourceTasks.findIndex((task) => task.id === input.taskId);
    if (movingTaskIndex === -1) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    const [movingTask] = sourceTasks.splice(movingTaskIndex, 1);
    if (!movingTask) {
      throw new AppError("Task not found", StatusCodes.NOT_FOUND);
    }

    const nextSourceTasks =
      input.sourceStatus === input.destinationStatus ? [...sourceTasks] : sourceTasks;
    const nextDestinationTasks =
      input.sourceStatus === input.destinationStatus ? nextSourceTasks : [...destinationTasks];

    movingTask.status = input.destinationStatus;
    nextDestinationTasks.splice(input.destinationIndex, 0, movingTask);

    const sourceOperations =
      input.sourceStatus === input.destinationStatus
        ? []
        : nextSourceTasks.map((task, index) => ({
            updateOne: {
              filter: { _id: task._id },
              update: { $set: { position: index } }
            }
          }));

    const destinationOperations = nextDestinationTasks.map((task, index) => ({
      updateOne: {
        filter: { _id: task._id },
        update: {
          $set: {
            position: index,
            status: input.destinationStatus
          }
        }
      }
    }));

    const operations = [
      ...sourceOperations,
      ...destinationOperations
    ];

    await this.taskRepository.bulkWrite(operations);
    const board = await this.listBoard();
    socketService.emitBoardUpdated({ type: "tasks_reordered", board });
    return board;
  }
}
