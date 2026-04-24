import type { AssignmentHistoryEntry, Task } from "@neo/types";
import { http } from "../lib/http";

export const assignTask = async (taskId: string, assigneeId: string | null) =>
  (
    await http.patch<{ task: Task; assignmentHistory: AssignmentHistoryEntry[] }>(
      `/assignments/${taskId}`,
      { assigneeId }
    )
  ).data;

