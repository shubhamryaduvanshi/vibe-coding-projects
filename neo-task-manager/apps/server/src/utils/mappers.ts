import type {
  AssignmentHistoryEntry,
  AuthUser,
  Task,
  TimeReportRow,
  UserSummary,
  Worklog
} from "@neo/types";
import type { AssignmentHistoryDocument } from "../models/assignment-history.model.js";
import type { TaskDocument } from "../models/task.model.js";
import type { UserDocument } from "../models/user.model.js";
import type { WorklogDocument } from "../models/worklog.model.js";

const mapUserSummary = (user: UserDocument | null | undefined): UserSummary | null =>
  user
    ? {
        id: user.id,
        name: user.name,
        email: user.email
      }
    : null;

export const toAuthUser = (user: UserDocument): AuthUser => ({
  ...(mapUserSummary(user) as UserSummary),
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString()
});

export const toTask = (task: TaskDocument): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  assignee: mapUserSummary(
    task.populated("assignee") ? (task.assignee as unknown as UserDocument) : null
  ),
  dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  createdBy: mapUserSummary(task.createdBy as unknown as UserDocument)!,
  position: task.position,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString()
});

export const toAssignmentHistory = (
  entry: AssignmentHistoryDocument
): AssignmentHistoryEntry => ({
  id: entry.id,
  taskId: entry.taskId.toString(),
  oldAssignee: mapUserSummary(
    entry.populated("oldAssignee")
      ? (entry.oldAssignee as unknown as UserDocument)
      : null
  ),
  newAssignee: mapUserSummary(
    entry.populated("newAssignee")
      ? (entry.newAssignee as unknown as UserDocument)
      : null
  ),
  changedBy: mapUserSummary(entry.changedBy as unknown as UserDocument)!,
  timestamp: entry.timestamp.toISOString()
});

export const toWorklog = (worklog: WorklogDocument): Worklog => ({
  id: worklog.id,
  taskId: worklog.taskId.toString(),
  user: mapUserSummary(worklog.userId as unknown as UserDocument)!,
  hours: worklog.hours,
  description: worklog.description,
  createdAt: worklog.createdAt.toISOString()
});

export const toTimeReportRow = (row: {
  title: string;
  status: TimeReportRow["status"];
  assignee: string | null;
  totalHours: number;
}): TimeReportRow => row;

export const toUserSummary = (user: UserDocument): UserSummary => ({
  id: user.id,
  name: user.name,
  email: user.email
});
