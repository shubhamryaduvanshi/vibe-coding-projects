import type {
  BoardResponse,
  ReorderTaskInput,
  Task,
  TaskDetailsResponse
} from "@neo/types";
import { http } from "../lib/http";

export const fetchBoard = async () => (await http.get<BoardResponse>("/tasks")).data;

export const createTask = async (payload: {
  title: string;
  description?: string;
  dueDate?: string | null;
}) => (await http.post<{ task: Task }>("/tasks", payload)).data;

export const updateTask = async (
  taskId: string,
  payload: Partial<{ title: string; description: string; dueDate: string | null }>
) => (await http.patch<{ task: Task }>(`/tasks/${taskId}`, payload)).data;

export const getTaskDetails = async (taskId: string) =>
  (await http.get<TaskDetailsResponse>(`/tasks/${taskId}`)).data;

export const reorderTasks = async (payload: ReorderTaskInput) =>
  (await http.post<BoardResponse>("/tasks/reorder", payload)).data;

