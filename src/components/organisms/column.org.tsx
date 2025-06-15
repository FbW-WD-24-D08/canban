import { tasksApi } from "@/api/tasks.api";
import { useTasks } from "@/hooks/useTasks";
import type { Column, Task } from "@/types/api.types";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { TaskCard } from "../molecules/task-card.comp";

interface ColumnProps {
  column: Column;
  refreshToken?: number;
}

export function Column({ column, refreshToken = 0 }: ColumnProps) {
  // Only Done column supports archive toggle
  const isDoneColumn = column.title.toLowerCase() === "done";

  const [showArchive, setShowArchive] = useState(false);

  const { tasks, loading, refetch } = useTasks(column.id, isDoneColumn); // include archived only for Done column
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { setNodeRef } = useDroppable({ id: column.id, data: { columnId: column.id } });

  // refetch tasks when token changes (e.g., after drag)
  useEffect(() => {
    refetch();
  }, [refreshToken]);

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await tasksApi.createTask({ title: newTitle, description: newDesc, columnId: column.id });
      setNewTitle("");
      setNewDesc("");
      setAdding(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  // Split tasks into active / archived
  const activeTasks = tasks.filter((t) => !t.archived);
  const archivedTasks = tasks.filter((t) => t.archived);

  return (
    <div
      ref={setNodeRef}
      className="w-72 flex-shrink-0 bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-xl p-4 space-y-4"
      onKeyDown={(e) => {
        if (e.key.toLowerCase() === "n" && !adding) {
          setAdding(true);
          setTimeout(() => {
            const input = document.querySelector<HTMLInputElement>("input[placeholder='Task title']");
            input?.focus();
          }, 0);
        }
      }}
      tabIndex={0}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <h3 className="text-sm font-semibold text-white truncate">{column.title}</h3>
        </div>
        <span className="text-xs text-zinc-400">{activeTasks.length}</span>
      </div>

      {isDoneColumn ? (
        <Collapsible.Root open={showArchive} onOpenChange={setShowArchive}>
          <Collapsible.Trigger asChild>
            <button className="text-[10px] text-teal-400 hover:underline mb-1">
              {showArchive ? "Hide" : "Show"} archive ({archivedTasks.length})
            </button>
          </Collapsible.Trigger>

          <div className="space-y-4">
            <SortableContext id={column.id} items={activeTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {loading ? (
                <div className="text-zinc-400 text-sm">Loading tasks...</div>
              ) : activeTasks.length === 0 ? (
                <div className="text-zinc-500 text-sm">No tasks</div>
              ) : (
                activeTasks.map((task: Task) => (
                  <TaskCard key={task.id} task={task} isDoneColumn onUpdated={refetch} />
                ))
              )}
            </SortableContext>

            <Collapsible.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
              {archivedTasks.length > 0 && (
                <div className="pt-2 border-t border-zinc-700 space-y-2">
                  {archivedTasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} isArchived onUpdated={refetch} />
                  ))}
                </div>
              )}
            </Collapsible.Content>

            {adding ? (
              <div className="mt-4 space-y-2">
                <input
                  className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 text-sm focus:border-teal-500 focus:outline-none"
                  placeholder="Task title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                  className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 text-sm h-16 focus:border-teal-500 focus:outline-none"
                  placeholder="Description (optional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTask}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 rounded-md"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setAdding(false);
                      setNewTitle("");
                      setNewDesc("");
                    }}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="mt-4 w-full flex items-center justify-center gap-1 text-xs text-zinc-300 hover:text-white"
              >
                <Plus className="w-3 h-3" /> Add task
              </button>
            )}
          </div>
        </Collapsible.Root>
      ) : (
        <div className="space-y-4">
          <SortableContext id={column.id} items={activeTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {loading ? (
              <div className="text-zinc-400 text-sm">Loading tasks...</div>
            ) : activeTasks.length === 0 ? (
              <div className="text-zinc-500 text-sm">No tasks</div>
            ) : (
              activeTasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} onUpdated={refetch} />
              ))
            )}
          </SortableContext>

          {adding ? (
            <div className="mt-4 space-y-2">
              <input
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 text-sm focus:border-teal-500 focus:outline-none"
                placeholder="Task title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 text-sm h-16 focus:border-teal-500 focus:outline-none"
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddTask}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 rounded-md"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setAdding(false);
                    setNewTitle("");
                    setNewDesc("");
                  }}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="mt-4 w-full flex items-center justify-center gap-1 text-xs text-zinc-300 hover:text-white"
            >
              <Plus className="w-3 h-3" /> Add task
            </button>
          )}
        </div>
      )}
    </div>
  );
} 