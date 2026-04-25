import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { Button, Card } from "@neo/ui";
import { reorderTasks } from "../api/tasks";
import { CreateTaskForm } from "../features/board/create-task-form";
import { BoardColumn } from "../features/board/board-column";
import { TaskModal } from "../features/board/task-modal";
import { useBoard } from "../features/board/use-board";
import { useBoardStore } from "../features/board/board-store";

export const BoardPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useBoard();
  const { selectedTask, setSelectedTask } = useBoardStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const reorderMutation = useMutation({
    mutationFn: reorderTasks,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["board"] });
    }
  });

  if (isLoading || !data) {
    return <div>Loading board...</div>;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const activeTask = data.columns.flatMap((column) => column.tasks).find((task) => task.id === event.active.id);
    if (!activeTask || !event.over) {
      return;
    }

    const destinationColumn =
      data.columns.find((column) => column.status === event.over?.id) ??
      data.columns.find((column) => column.tasks.some((task) => task.id === event.over?.id));

    if (!destinationColumn) {
      return;
    }

    const sourceColumn = data.columns.find((column) => column.status === activeTask.status);
    const sourceIndex = sourceColumn?.tasks.findIndex((task) => task.id === activeTask.id) ?? 0;
    const destinationIndex =
      destinationColumn.tasks.findIndex((task) => task.id === event.over?.id) >= 0
        ? destinationColumn.tasks.findIndex((task) => task.id === event.over?.id)
        : destinationColumn.tasks?.length;

    reorderMutation.mutate({
      taskId: activeTask.id,
      sourceStatus: activeTask.status,
      destinationStatus: destinationColumn.status,
      sourceIndex,
      destinationIndex
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold">Global Kanban Board</h2>
          <p className="text-sm text-zinc-400">
            One realtime board shared by every user across eight delivery stages.
          </p>
        </div>
        <Card className="flex items-center gap-4 px-4 py-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Columns</div>
            <div className="text-xl font-semibold text-white">{data.columns.length}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Tasks</div>
            <div className="text-xl font-semibold text-white">
              {data.columns.reduce((sum, column) => sum + column.tasks.length, 0)}
            </div>
          </div>
          <Button variant="ghost">Live Sync Active</Button>
        </Card>
      </div>

      <CreateTaskForm />

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 overflow-x-auto pb-4 xl:grid-cols-4 2xl:grid-cols-4">
          {data.columns.map((column) => (
            <BoardColumn
              key={column.status}
              column={column}
              onSelectTask={(taskId) =>
                setSelectedTask(
                  data.columns.flatMap((entry) => entry.tasks).find((task) => task.id === taskId) ??
                    null
                )
              }
            />
          ))}
        </div>
      </DndContext>

      <TaskModal
        open={Boolean(selectedTask)}
        taskId={selectedTask?.id ?? null}
        onClose={() => setSelectedTask(null)}
        users={data.users}
      />
    </div>
  );
};

