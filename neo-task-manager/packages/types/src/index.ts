export type TaskStatus =
  | "Backlog"
  | "Selected"
  | "In Progress"
  | "Review"
  | "QA"
  | "Blocked"
  | "Done"
  | "Archived";

export const TASK_STATUSES: TaskStatus[] = [
  "Backlog",
  "Selected",
  "In Progress",
  "Review",
  "QA",
  "Blocked",
  "Done",
  "Archived"
];

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface AuthUser extends UserSummary {
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: UserSummary | null;
  dueDate: string | null;
  createdBy: UserSummary;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentHistoryEntry {
  id: string;
  taskId: string;
  oldAssignee: UserSummary | null;
  newAssignee: UserSummary | null;
  changedBy: UserSummary;
  timestamp: string;
}

export interface Worklog {
  id: string;
  taskId: string;
  user: UserSummary;
  hours: number;
  description: string;
  createdAt: string;
}

export interface BoardColumn {
  status: TaskStatus;
  tasks: Task[];
}

export interface AuthResponse {
  user: AuthUser;
}

export interface BoardResponse {
  columns: BoardColumn[];
  users: UserSummary[];
}

export interface TaskDetailsResponse {
  task: Task;
  assignmentHistory: AssignmentHistoryEntry[];
  worklogs: Worklog[];
}

export interface TimeReportRow {
  title: string;
  status: TaskStatus;
  assignee: string | null;
  totalHours: number;
}

export interface TimeReportResponse {
  rows: TimeReportRow[];
  grandTotalHours: number;
}

export interface ApiErrorPayload {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ReorderTaskInput {
  taskId: string;
  sourceStatus: TaskStatus;
  destinationStatus: TaskStatus;
  sourceIndex: number;
  destinationIndex: number;
}

