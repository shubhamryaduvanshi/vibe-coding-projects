import type { BoardColumn as BoardColumnType } from "@neo/types";
import { Card } from "@neo/ui";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./task-card";

export const BoardColumn = ({
  column,
  onSelectTask
}: {
  column: BoardColumnType;
  onSelectTask: (taskId: string) => void;
}) => {
  const { setNodeRef } = useDroppable({
    id: column.status,
    data: { status: column.status }
  });

  return (
    <Card className="min-h-[500px] min-w-[290px] bg-zinc-950/90 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">
          {column.status}
        </h2>
        <span className="rounded-full bg-red-600/20 px-2 py-1 text-xs text-red-300">
          {column.tasks.length}
        </span>
      </div>
      <div ref={setNodeRef} className="space-y-3">
        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onSelect={() => onSelectTask(task.id)} />
          ))}
        </SortableContext>
      </div>
    </Card>
  );
};

