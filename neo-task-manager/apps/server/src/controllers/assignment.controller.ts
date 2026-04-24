import type { Request, Response } from "express";
import { AssignmentService } from "../services/assignment.service.js";

export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  assignTask = async (request: Request, response: Response) =>
    response.json(
      await this.assignmentService.assignTask({
        taskId: request.params.taskId as string,
        assigneeId: request.body.assigneeId,
        changedBy: request.user!.id
      })
    );
}
