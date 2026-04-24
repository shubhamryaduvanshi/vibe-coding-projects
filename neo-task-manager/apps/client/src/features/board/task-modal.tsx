import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Modal, Tabs, TextArea } from "@neo/ui";
import { assignTask } from "../../api/assignments";
import { getTaskDetails, updateTask } from "../../api/tasks";
import { createWorklog } from "../../api/worklogs";
import { socket } from "../../lib/socket";
import { boardQueryKey } from "./use-board";
import type { UserSummary } from "@neo/types";

type TabKey = "details" | "history" | "worklogs";

export const TaskModal = ({
  taskId,
  open,
  onClose,
  users
}: {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
  users: UserSummary[];
}) => {
  const [tab, setTab] = useState<TabKey>("details");
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["task-details", taskId],
    queryFn: () => getTaskDetails(taskId!),
    enabled: Boolean(taskId && open)
  });

  useEffect(() => {
    const handleUpdate = (payload: { taskId: string }) => {
      if (payload.taskId === taskId) {
        void queryClient.invalidateQueries({ queryKey: ["task-details", taskId] });
        void queryClient.invalidateQueries({ queryKey: boardQueryKey });
      }
    };

    socket.on("task:details-updated", handleUpdate);
    return () => {
      socket.off("task:details-updated", handleUpdate);
    };
  }, [queryClient, taskId]);

  const saveMutation = useMutation({
    mutationFn: (payload: { title: string; description: string; dueDate: string | null }) =>
      updateTask(taskId!, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["task-details", taskId] });
      void queryClient.invalidateQueries({ queryKey: boardQueryKey });
    }
  });

  const assignMutation = useMutation({
    mutationFn: (assigneeId: string | null) => assignTask(taskId!, assigneeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["task-details", taskId] });
      void queryClient.invalidateQueries({ queryKey: boardQueryKey });
    }
  });

  const worklogMutation = useMutation({
    mutationFn: (payload: { hours: number; description: string }) => createWorklog(taskId!, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["task-details", taskId] });
    }
  });

  const task = query.data?.task;
  const [form, setForm] = useState({ title: "", description: "", dueDate: "" });
  const [worklogForm, setWorklogForm] = useState({ hours: "1", description: "" });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ""
      });
    }
  }, [task]);

  return (
    <Modal open={open} title={task?.title ?? "Task Details"} onClose={onClose}>
      {task ? (
        <div className="space-y-5">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { label: "Details", value: "details" },
              { label: "Assignment History", value: "history" },
              { label: "Worklogs", value: "worklogs" }
            ]}
          />

          {tab === "details" ? (
            <div className="space-y-4">
              <div className="grid gap-3">
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
                <TextArea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, dueDate: event.target.value }))
                  }
                />
                <select
                  className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-white"
                  value={task.assignee?.id ?? ""}
                  onChange={(event) =>
                    assignMutation.mutate(event.target.value ? event.target.value : null)
                  }
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() =>
                  saveMutation.mutate({
                    title: form.title,
                    description: form.description,
                    dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
                  })
                }
              >
                Save Changes
              </Button>
            </div>
          ) : null}

          {tab === "history" ? (
            <div className="space-y-3">
              {query.data?.assignmentHistory.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-zinc-800 p-3">
                  <div className="text-sm text-white">
                    {entry.changedBy.name} changed assignee
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {entry.oldAssignee?.name ?? "Unassigned"} {"->"}{" "}
                    {entry.newAssignee?.name ?? "Unassigned"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "worklogs" ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[120px_1fr_auto]">
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={worklogForm.hours}
                  onChange={(event) =>
                    setWorklogForm((prev) => ({ ...prev, hours: event.target.value }))
                  }
                />
                <Input
                  placeholder="Describe work completed"
                  value={worklogForm.description}
                  onChange={(event) =>
                    setWorklogForm((prev) => ({
                      ...prev,
                      description: event.target.value
                    }))
                  }
                />
                <Button
                  onClick={() =>
                    worklogMutation.mutate({
                      hours: Number(worklogForm.hours),
                      description: worklogForm.description
                    })
                  }
                >
                  Add Worklog
                </Button>
              </div>

              <div className="space-y-3">
                {query.data?.worklogs.map((worklog) => (
                  <div key={worklog.id} className="rounded-lg border border-zinc-800 p-3">
                    <div className="text-sm font-medium text-white">
                      {worklog.hours}h by {worklog.user.name}
                    </div>
                    <div className="mt-1 text-sm text-zinc-400">{worklog.description}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {new Date(worklog.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div>Loading task...</div>
      )}
    </Modal>
  );
};
