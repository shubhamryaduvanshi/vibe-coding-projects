import { calculateGrandTotal } from "@neo/utils";
import { TaskRepository } from "../repositories/task.repository.js";
import { WorklogRepository } from "../repositories/worklog.repository.js";
import { toTimeReportRow } from "../utils/mappers.js";

export class ReportService {
  constructor(
    private readonly worklogRepository: WorklogRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async getTimeReport() {
    const [aggregates, tasks] = await Promise.all([
      this.worklogRepository.aggregateTimeReport(),
      this.taskRepository.listBoardTasks()
    ]);

    const hoursByTaskId = new Map(aggregates.map((entry) => [entry._id.toString(), entry.totalHours]));

    const rows = tasks.map((task) =>
      toTimeReportRow({
        title: task.title,
        status: task.status,
        assignee:
          task.populated("assignee") && task.assignee
            ? (task.assignee as unknown as { name: string }).name
            : null,
        totalHours: Number((hoursByTaskId.get(task.id) ?? 0).toFixed(2))
      })
    );

    return {
      rows,
      grandTotalHours: Number(calculateGrandTotal(rows).toFixed(2))
    };
  }
}
