import { tasksApi } from "@/api/tasks.api";
import type { Task } from "@/types/api.types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Archive, Paperclip, RotateCcw } from "lucide-react";
import { useState } from "react";
import { TaskDialog } from "./task-dialog.comp";

interface TaskCardProps {
  task: Task;
  onUpdated?: () => void;
  isDoneColumn?: boolean;
  isArchived?: boolean;
}

export function TaskCard({ task, onUpdated, isDoneColumn = false, isArchived = false }: TaskCardProps) {
  const [open, setOpen] = useState(false);

  const [archiving, setArchiving] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    data: { columnId: task.columnId, task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const archiveTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setArchiving(true);
      await tasksApi.updateTask(task.id, { archived: true });
      onUpdated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setArchiving(false);
    }
  };

  const restoreTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setArchiving(true);
      await tasksApi.updateTask(task.id, { archived: false });
      onUpdated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setArchiving(false);
    }
  };

  const statusMap: Record<string, string> = {
    todo: "bg-zinc-700/20 text-zinc-300",
    "in-progress": "bg-yellow-600/20 text-yellow-400",
    done: "bg-green-600/20 text-green-400",
  };

  const statusKey = task.status ?? "todo";

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setOpen(true);
          }
          if (!isArchived && isDoneColumn && e.key.toLowerCase() === "a") {
            archiveTask(e as any);
          }
          if (isArchived && e.key.toLowerCase() === "r") {
            restoreTask(e as any);
          }
        }}
        className="bg-zinc-800/80 border border-zinc-700 rounded-lg p-3 text-sm text-white hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer select-none"
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
      >
        <div className="flex items-center gap-2 mb-1">
          {isArchived ? (
            <span className="px-2 py-[1px] rounded bg-zinc-700/40 text-zinc-400 text-[10px] uppercase">Archived</span>
          ) : (
            <span
              className={`px-2 py-[1px] rounded text-[10px] uppercase ${statusMap[statusKey] || "bg-zinc-700/20 text-zinc-300"}`}
            >
              {statusKey}
            </span>
          )}
          <div className="font-medium truncate flex-1">{task.title}</div>

          {isDoneColumn && !isArchived && (
            <button
              title="Archive"
              onClick={archiveTask}
              className="text-zinc-400 hover:text-zinc-200"
              disabled={archiving}
            >
              <Archive className="w-3 h-3" />
            </button>
          )}

          {isArchived && (
            <button
              title="Restore"
              onClick={restoreTask}
              className="text-zinc-400 hover:text-zinc-200"
              disabled={archiving}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
        {task.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{task.description}</p>
        )}
        {task.attachments && task.attachments.length > 0 && (
          <div className="text-[10px] text-teal-400 mb-1 flex items-center gap-1">
            <Paperclip className="w-3 h-3" /> {task.attachments.length}
          </div>
        )}
        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <span>Today</span>
          <span className="flex items-center gap-1">🧑‍🤝‍🧑 0</span>
        </div>
      </div>
      <TaskDialog task={task} open={open} onOpenChange={setOpen} onSaved={onUpdated} onDeleted={onUpdated} />
    </>
  );
} 