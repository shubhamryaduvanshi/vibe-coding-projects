import { AssignmentService } from "../services/assignment.service";

describe("AssignmentService", () => {
  it("creates assignment history when assignee changes", async () => {
    const historyRepository = {
      create: jest.fn(),
      listByTask: jest.fn().mockResolvedValue([])
    };
    const taskRepository = {
      findById: jest.fn().mockResolvedValue({
        id: "task-1",
        assignee: "old-user"
      }),
      updateTask: jest.fn().mockResolvedValue({
        id: "task-1",
        title: "Task",
        description: "",
        status: "Backlog",
        assignee: null,
        dueDate: null,
        createdBy: { id: "creator", name: "Creator", email: "c@example.com" },
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        populated: () => true
      })
    };
    const userRepository = {
      findById: jest.fn().mockResolvedValue({ id: "new-user" })
    };

    const service = new AssignmentService(
      historyRepository as never,
      taskRepository as never,
      userRepository as never
    );

    await service.assignTask({
      taskId: "task-1",
      assigneeId: "new-user",
      changedBy: "manager"
    });

    expect(historyRepository.create).toHaveBeenCalledWith({
      taskId: "task-1",
      oldAssignee: "old-user",
      newAssignee: "new-user",
      changedBy: "manager"
    });
  });
});
