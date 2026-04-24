import type { Request, Response } from "express";
import { ReportService } from "../services/report.service.js";

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  getTimeReport = async (_request: Request, response: Response) =>
    response.json(await this.reportService.getTimeReport());
}

