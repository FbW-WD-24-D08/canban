import { columnsApi } from "@/api/columns.api";
import { useTasks } from "@/hooks/useTasks";
import { getIconComponent } from "@/lib/icon-map";
import { getMeisterTaskColumnColor, getMeisterTaskColumnIcon } from "@/lib/meistertask-setup";
import type { Column as ColumnType, Task } from "@/types/api.types";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { GripVertical, MoreVertical, Pencil, Plus, Smile, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useToast } from "../contexts/toast.context";
import { DeleteConfirmationModal } from "../molecules/confirmation-modal.comp";
import { IconPicker } from "../molecules/icon-picker.comp";
import { TaskCard } from "../molecules/task-card.comp";

interface ColumnProps {
  column: ColumnType;
  refreshToken?: number;
  onColumnDeleted: () => void;
  onColumnUpdated: () => void;
  listeners?: any;
  isDragging?: boolean;
  isMeisterTask?: boolean;
}

export function Column({
  column,
  refreshToken = 0,
  onColumnDeleted,
  onColumnUpdated,
  listeners,
  isDragging,
  isMeisterTask = false,
}: ColumnProps) {
  const { tasks, loading, refetch } = useTasks(column.id, refreshToken);
  const [currentTitle, setCurrentTitle] = useState(column.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const addTaskInputRef = useRef<HTMLInputElement>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [, startTransition] = useTransition();

  const toast = useToast();

  const isDoneColumn = useMemo(() => column.title.trim().toLowerCase() === "done", [column.title]);

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  useEffect(() => {
    setCurrentTitle(column.title);
  }, [column.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (adding && addTaskInputRef.current) {
      addTaskInputRef.current.focus();
    }
  }, [adding]);

  // --- Icon Rendering Logic ---
  // A much clearer, multi-step approach to prevent rendering crashes.
  const RadixIconComponent = getIconComponent(column.icon);
  let finalIconContent: React.ReactNode;

  if (RadixIconComponent) {
    // If the stored icon name maps to a Radix component, render it.
    finalIconContent = <RadixIconComponent />;
  } else if (column.icon) {
    // If there's an icon string but it's not a Radix component, it's an emoji.
    finalIconContent = column.icon;
  } else if (isMeisterTask) {
    // For MeisterTask boards with no icon set, use the default getter.
    finalIconContent = getMeisterTaskColumnIcon(column.title);
  } else {
    // Absolute fallback for any other case.
    finalIconContent = '📄';
  }

  const columnColor = isMeisterTask ? column.color || getMeisterTaskColumnColor(column.title) : null;

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await columnsApi.createTask(column.id, { title: newTaskTitle });
      setNewTaskTitle("");
      setAdding(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteColumn = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      await columnsApi.deleteColumn(column.id);
      toast.success("Column deleted", `The "${column.title}" column and all its tasks have been deleted.`);
      onColumnDeleted();
    } catch (err) {
      console.error("Failed to delete column", err);
      toast.error("Delete failed", "Could not delete the column. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateColumn = async (data: Partial<ColumnType>) => {
    try {
      await columnsApi.updateColumn(column.id, data);
      onColumnUpdated();
    } catch (err) {
      console.error("Failed to update column", err);
      toast.error("Update failed", "Could not update the column.");
    }
  };

  const handleUpdateColumnTitle = async () => {
    if (!currentTitle.trim() || currentTitle.trim() === column.title) {
      setIsEditingTitle(false);
      setCurrentTitle(column.title);
      return;
    }
    await handleUpdateColumn({ title: currentTitle.trim() });
    setIsEditingTitle(false);
  };

  const activeTasks = tasks.filter((t) => !t.archived);
  const archivedTasks = tasks.filter((t) => t.archived);

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 ${
        isMeisterTask
          ? "bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-700 shadow-lg"
          : "bg-zinc-900/70 border border-zinc-800"
      } backdrop-blur rounded-xl p-4 space-y-4 flex flex-col transition-all duration-200 ${
        isDragging ? "opacity-50 rotate-2 scale-105" : "opacity-100"
      }`}
      style={isMeisterTask && columnColor ? { borderTopColor: columnColor, borderTopWidth: "3px" } : {}}
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
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            {...listeners}
            className={`cursor-grab transition-colors ${
              isMeisterTask
                ? "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                : "text-zinc-500 hover:text-white"
            }`}
            aria-label="Drag to reorder column"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {isMeisterTask && (
            <div className="text-lg" style={{ color: columnColor || "#9E9E9E" }}>
              {finalIconContent}
            </div>
          )}

          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              onBlur={handleUpdateColumnTitle}
              onKeyDown={(e) => e.key === "Enter" && handleUpdateColumnTitle()}
              className={`text-sm font-semibold border rounded-md px-2 py-1 truncate focus:outline-none w-full ${
                isMeisterTask
                  ? "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:border-teal-500"
                  : "bg-zinc-800 border-teal-500 text-white"
              }`}
              placeholder="Column title"
              aria-label="Column title"
            />
          ) : (
            <h3
              className={`text-sm font-semibold truncate ${
                isMeisterTask ? "text-zinc-900 dark:text-white" : "text-white"
              }`}
              style={isMeisterTask && columnColor ? { color: columnColor } : {}}
            >
              {column.title}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isMeisterTask
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                : "bg-zinc-800 text-zinc-400"
            }`}
          >
            {activeTasks.length}
          </span>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={`p-1 rounded-md transition-colors ${
                  isMeisterTask
                    ? "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
                aria-label="Column options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={5}
                className={`border rounded-md shadow-lg p-1 text-sm min-w-[150px] z-[1000] ${
                  isMeisterTask
                    ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200"
                    : "bg-zinc-800 border-zinc-700 text-zinc-200"
                }`}
              >
                <DropdownMenu.Item
                  onSelect={() => setIsEditingTitle(true)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-teal-600 hover:text-white cursor-pointer focus:outline-none focus:bg-teal-600"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit title</span>
                </DropdownMenu.Item>

                {isMeisterTask && (
                  <IconPicker
                    onSelect={(iconName) => {
                      startTransition(() => {
                        handleUpdateColumn({ icon: iconName });
                      });
                    }}
                    isMeisterTask={isMeisterTask}
                  >
                    <DropdownMenu.Item
                      onSelect={(e) => e.preventDefault()}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-teal-600 hover:text-white cursor-pointer focus:outline-none focus:bg-teal-600"
                    >
                      <Smile className="w-3.5 h-3.5" />
                      <span>Change icon</span>
                    </DropdownMenu.Item>
                  </IconPicker>
                )}

                <DropdownMenu.Separator
                  className={`h-[1px] my-1 ${isMeisterTask ? "bg-zinc-200 dark:bg-zinc-700" : "bg-zinc-700"}`}
                />
                <DropdownMenu.Item
                  onSelect={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-red-600 hover:text-white cursor-pointer focus:outline-none focus:bg-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete column</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
        <SortableContext items={activeTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {loading ? (
            <div className="text-center text-zinc-400 text-sm py-4">Loading tasks...</div>
          ) : activeTasks.length === 0 ? (
            <div
              className={`text-center text-sm py-8 ${
                isMeisterTask ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500"
              }`}
            >
              No tasks yet
            </div>
          ) : (
            activeTasks.map((task: Task) => (
              <TaskCard key={task.id} task={task} onTaskUpdated={refetch} isMeisterTask={isMeisterTask} />
            ))
          )}
        </SortableContext>

        {isDoneColumn && archivedTasks.length > 0 && (
          <Collapsible.Root open={showArchive} onOpenChange={setShowArchive}>
            <Collapsible.Trigger asChild>
              <button
                className={`w-full text-left text-xs font-medium py-2 px-3 rounded-md transition-colors ${
                  isMeisterTask
                    ? "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
                aria-label="Toggle archived tasks"
              >
                <div className="flex items-center justify-between">
                  <span>Archived ({archivedTasks.length})</span>
                  {showArchive ? (
                    <Trash2 className="w-3 h-3" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                </div>
              </button>
            </Collapsible.Trigger>
            <Collapsible.Content className="pt-2 space-y-2">
              {archivedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onTaskUpdated={refetch} isMeisterTask={isMeisterTask} />
              ))}
            </Collapsible.Content>
          </Collapsible.Root>
        )}
      </div>

      {adding ? (
        <div className="mt-auto pt-2">
          <input
            ref={addTaskInputRef}
            className={`w-full rounded-md p-2 text-sm focus:outline-none ${
              isMeisterTask
                ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-teal-500"
                : "bg-zinc-800 border border-zinc-700 text-white focus:border-teal-500"
            }`}
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
              if (e.key === "Escape") setAdding(false);
            }}
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleAddTask} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 rounded-md">
              Add Task
            </button>
            <button
              onClick={() => setAdding(false)}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className={`w-full mt-auto rounded-md py-2 text-xs transition-colors flex items-center justify-center ${
            isMeisterTask
              ? "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add task
        </button>
      )}

      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteColumn}
        itemName={column.title}
        itemType="column"
        loading={deleting}
      />
    </div>
  );
}
