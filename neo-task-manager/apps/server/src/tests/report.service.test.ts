import { ReportService } from "../services/report.service";

describe("ReportService", () => {
  it("calculates row totals and a grand total", async () => {
    const worklogRepository = {
      aggregateTimeReport: jest.fn().mockResolvedValue([
        { _id: "task-1", totalHours: 2.5 },
        { _id: "task-2", totalHours: 1.25 }
      ])
    };

    const taskRepository = {
      listBoardTasks: jest.fn().mockResolvedValue([
        {
          id: "task-1",
          title: "First",
          status: "Backlog",
          assignee: { name: "Alex" },
          populated: () => true
        },
        {
          id: "task-2",
          title: "Second",
          status: "Done",
          assignee: null,
          populated: () => false
        }
      ])
    };

    const service = new ReportService(worklogRepository as never, taskRepository as never);
    const result = await service.getTimeReport();

    expect(result.rows).toEqual([
      { title: "First", status: "Backlog", assignee: "Alex", totalHours: 2.5 },
      { title: "Second", status: "Done", assignee: null, totalHours: 1.25 }
    ]);
    expect(result.grandTotalHours).toBe(3.75);
  });
});
