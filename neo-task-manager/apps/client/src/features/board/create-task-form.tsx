import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Input, TextArea } from "@neo/ui";
import { createTask } from "../../api/tasks";
import { boardQueryKey } from "./use-board";

export const CreateTaskForm = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      setTitle("");
      setDescription("");
      void queryClient.invalidateQueries({ queryKey: boardQueryKey });
    }
  });

  return (
    <Card className="mb-6 border-red-900/40 bg-zinc-950/95 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Create Task</h2>
          <p className="text-sm text-zinc-400">Title is required. New tasks land in Backlog.</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_auto] md:items-start">
        <Input
          maxLength={255}
          placeholder="Ship reporting dashboard"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextArea
          placeholder="Optional description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-[44px]"
        />
        <Button
          className="h-11"
          onClick={() => mutation.mutate({ title, description })}
          disabled={!title.trim()}
        >
          Add Task
        </Button>
      </div>
    </Card>
  );
};

