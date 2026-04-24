import type { Worklog } from "@neo/types";
import { http } from "../lib/http";

export const createWorklog = async (
  taskId: string,
  payload: { hours: number; description: string }
) => (await http.post<{ worklogs: Worklog[] }>(`/worklogs/${taskId}`, payload)).data;

