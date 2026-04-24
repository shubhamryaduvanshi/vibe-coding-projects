import { TASK_STATUSES, type Task, type TaskStatus } from "@neo/types";

export const COOKIE_NAMES = {
  accessToken: "neo_access_token",
  refreshToken: "neo_refresh_token"
} as const;

export const MAX_TASK_TITLE_LENGTH = 255;

export const isTaskStatus = (value: string): value is TaskStatus =>
  TASK_STATUSES.includes(value as TaskStatus);

export const groupTasksByStatus = (tasks: Task[]) =>
  TASK_STATUSES.map((status) => ({
    status,
    tasks: tasks
      .filter((task) => task.status === status)
      .sort((left, right) => left.position - right.position)
  }));

export const calculateGrandTotal = (rows: Array<{ totalHours: number }>) =>
  rows.reduce((sum, row) => sum + row.totalHours, 0);

export const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "Not set";

