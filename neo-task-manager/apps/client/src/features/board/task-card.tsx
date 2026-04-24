import { Card } from "@neo/ui";
import type { Task } from "@neo/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const TaskCard = ({
  task,
  onSelect
}: {
  task: Task;
  onSelect: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    data: { task }
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <Card
        className="cursor-grab border-zinc-800 p-4 hover:border-red-500"
        onClick={onSelect}
      >
        <div className="text-sm font-semibold text-white">{task.title}</div>
        <div className="mt-2 text-xs text-zinc-400">
          {task.assignee ? `Assigned to ${task.assignee.name}` : "Unassigned"}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
          <span>{task.status}</span>
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
        </div>
      </Card>
    </div>
  );
};

