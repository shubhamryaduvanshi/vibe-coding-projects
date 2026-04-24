import type { Request, Response } from "express";
import { TaskService } from "../services/task.service.js";
import { AssignmentService } from "../services/assignment.service.js";
import { WorklogService } from "../services/worklog.service.js";

export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly assignmentService: AssignmentService,
    private readonly worklogService: WorklogService
  ) {}

  listBoard = async (_request: Request, response: Response) =>
    response.json(await this.taskService.listBoard());

  createTask = async (request: Request, response: Response) =>
    response.status(201).json(
      await this.taskService.createTask({
        ...request.body,
        userId: request.user!.id
      })
    );

  updateTask = async (request: Request, response: Response) =>
    response.json(
      await this.taskService.updateTask(request.params.taskId as string, request.body)
    );

  getTaskDetails = async (request: Request, response: Response) =>
    response.json(
      await this.taskService.getTaskDetails(request.params.taskId as string, {
        loadHistory: (taskId) => this.assignmentService.listTaskHistory(taskId),
        loadWorklogs: (taskId) => this.worklogService.listTaskWorklogs(taskId)
      })
    );

  reorderTasks = async (request: Request, response: Response) =>
    response.json(await this.taskService.reorder(request.body));
}
