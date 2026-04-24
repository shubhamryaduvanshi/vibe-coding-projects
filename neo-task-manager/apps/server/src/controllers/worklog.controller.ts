import type { Request, Response } from "express";
import { WorklogService } from "../services/worklog.service.js";

export class WorklogController {
  constructor(private readonly worklogService: WorklogService) {}

  createWorklog = async (request: Request, response: Response) =>
    response.status(201).json(
      await this.worklogService.addWorklog({
        taskId: request.params.taskId,
        userId: request.user!.id,
        ...request.body
      })
    );
}

