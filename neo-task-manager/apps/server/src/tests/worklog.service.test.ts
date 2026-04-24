import { WorklogService } from "../services/worklog.service";

describe("WorklogService", () => {
  it("returns latest-first immutable worklogs after creation", async () => {
    const taskRepository = {
      findById: jest.fn().mockResolvedValue({ id: "task-1" })
    };
    const created: Array<{ taskId: string; userId: string; hours: number; description: string }> = [];
    const worklogRepository = {
      create: jest.fn().mockImplementation(async (payload: {
        taskId: string;
        userId: string;
        hours: number;
        description: string;
      }) => {
        created.push(payload);
      }),
      listByTask: jest.fn().mockResolvedValue([
        {
          id: "w2",
          taskId: "task-1",
          userId: { id: "u1", name: "Alex", email: "alex@example.com" },
          hours: 2.5,
          description: "Focus work",
          createdAt: new Date("2026-04-22T10:00:00.000Z")
        }
      ])
    };

    const service = new WorklogService(worklogRepository as never, taskRepository as never);
    const result = await service.addWorklog({
      taskId: "task-1",
      userId: "u1",
      hours: 2.5,
      description: "Focus work"
    });

    expect(created).toHaveLength(1);
    expect(created[0]?.hours).toBe(2.5);
    expect(result.worklogs[0]?.description).toBe("Focus work");
  });
});
