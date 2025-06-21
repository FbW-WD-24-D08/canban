import { columnsApi } from "@/api/columns.api.ts";
import { tasksApi } from "@/api/tasks.api";
import { useTasks } from "@/hooks/useTasks";
import { getMeisterTaskColumnColor, getMeisterTaskColumnIcon } from "@/lib/meistertask-setup";
import type { Column, Task } from "@/types/api.types";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { GripVertical, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../contexts/toast.context";
import { DeleteConfirmationModal } from "../molecules/confirmation-modal.comp";
import { TaskCard } from "../molecules/task-card.comp";

interface ColumnProps {
  column: Column;
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
  // Only Done column supports archive toggle
  const isDoneColumn = column?.title?.toLowerCase() === "done";

  const [showArchive, setShowArchive] = useState(false);
  const { tasks, loading, refetch } = useTasks(column.id, isDoneColumn);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(column.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { columnId: column.id },
  });

  // Get MeisterTask styling - FORCE icons from function to ensure they work
  const columnColor = isMeisterTask ? (column.color || getMeisterTaskColumnColor(column.title)) : null;
  const columnIcon = isMeisterTask ? getMeisterTaskColumnIcon(column.title) : null;

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  // refetch tasks when token changes (e.g., after drag)
  useEffect(() => {
    refetch();
  }, [refreshToken]);

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    try {
      const taskData: any = {
        title: newTitle,
        description: newDesc,
        columnId: column.id,
      };

      // Add default priority for MeisterTask boards
      if (isMeisterTask) {
        taskData.priority = 'medium';
      }

      await tasksApi.createTask(taskData);
      setNewTitle("");
      setNewDesc("");
      setAdding(false);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteColumn = async () => {
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

  const handleUpdateColumnTitle = async () => {
    if (!currentTitle.trim() || currentTitle.trim() === column.title) {
      setIsEditingTitle(false);
      setCurrentTitle(column.title);
      return;
    }
    try {
      await columnsApi.updateColumn(column.id, { title: currentTitle.trim() });
      onColumnUpdated();
    } catch (err) {
      console.error("Failed to update column title", err);
    } finally {
      setIsEditingTitle(false);
    }
  };

  // Split tasks into active / archived
  const activeTasks = tasks.filter((t) => !t.archived);
  const archivedTasks = tasks.filter((t) => t.archived);

  return (
    <div
      ref={setNodeRef}
      className={`w-80 flex-shrink-0 ${
        isMeisterTask 
          ? 'bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-700 shadow-lg' 
          : 'bg-zinc-900/70 border border-zinc-800'
      } backdrop-blur rounded-xl p-4 space-y-4 flex flex-col transition-all duration-200 ${
        isDragging ? "opacity-50 rotate-2 scale-105" : "opacity-100"
      }`}
      style={isMeisterTask && columnColor ? {
        borderTopColor: columnColor,
        borderTopWidth: '3px'
      } : {}}
      onKeyDown={(e) => {
        if (e.key.toLowerCase() === "n" && !adding) {
          setAdding(true);
          setTimeout(() => {
            const input = document.querySelector<HTMLInputElement>(
              "input[placeholder='Task title']"
            );
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
                ? 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300' 
                : 'text-zinc-500 hover:text-white'
            }`}
            aria-label="Drag to reorder column"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          
          {/* MeisterTask column icon */}
          {isMeisterTask && (
            <span className="text-lg" style={{ color: columnColor || '#9E9E9E' }}>
              {columnIcon || '📄'}
            </span>
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
                  ? 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:border-teal-500'
                  : 'bg-zinc-800 border-teal-500 text-white'
              }`}
              placeholder="Column title"
              aria-label="Column title"
            />
          ) : (
            <h3 
              className={`text-sm font-semibold truncate ${
                isMeisterTask 
                  ? 'text-zinc-900 dark:text-white' 
                  : 'text-white'
              }`}
              style={isMeisterTask && columnColor ? { color: columnColor } : {}}
            >
              {column.title}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Task count badge */}
          <span 
            className={`text-xs px-2 py-1 rounded-full ${
              isMeisterTask
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}
            style={isMeisterTask && columnColor ? {
              backgroundColor: columnColor + '20',
              color: columnColor
            } : {}}
          >
            {activeTasks.length}
          </span>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className={`p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  isMeisterTask
                    ? 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
                aria-label="More actions"
                title="More actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={5}
                className={`border rounded-md shadow-lg p-1 text-sm min-w-[150px] z-[1000] ${
                  isMeisterTask
                    ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-200'
                }`}
              >
                <DropdownMenu.Item
                  onSelect={() => setIsEditingTitle(true)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-teal-600 hover:text-white cursor-pointer focus:outline-none focus:bg-teal-600"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit title</span>
                </DropdownMenu.Item>
                {!isMeisterTask && (
                  <>
                    <DropdownMenu.Separator className="h-[1px] bg-zinc-700 my-1" />
                    <DropdownMenu.Item
                      onSelect={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-red-600 hover:text-white cursor-pointer focus:outline-none focus:bg-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete column</span>
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {isDoneColumn ? (
        <Collapsible.Root open={showArchive} onOpenChange={setShowArchive}>
          <Collapsible.Trigger asChild>
            <button className="text-[10px] text-teal-400 hover:underline mb-1">
              {showArchive ? "Hide" : "Show"} archive ({archivedTasks.length})
            </button>
          </Collapsible.Trigger>

          <div className="space-y-4">
            <SortableContext
              id={column.id}
              items={activeTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {loading ? (
                <div className={`text-sm ${isMeisterTask ? 'text-zinc-500' : 'text-zinc-400'}`}>Loading tasks...</div>
              ) : activeTasks.length === 0 ? (
                <div className={`text-sm ${isMeisterTask ? 'text-zinc-400' : 'text-zinc-500'}`}>No tasks</div>
              ) : (
                activeTasks.map((task: Task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDoneColumn
                    onUpdated={refetch}
                    isMeisterTask={isMeisterTask}
                  />
                ))
              )}
            </SortableContext>

            <Collapsible.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
              {archivedTasks.length > 0 && (
                <div className={`pt-2 border-t space-y-2 ${isMeisterTask ? 'border-zinc-200 dark:border-zinc-700' : 'border-zinc-700'}`}>
                  {archivedTasks.map((task: Task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isArchived
                      onUpdated={refetch}
                      isMeisterTask={isMeisterTask}
                    />
                  ))}
                </div>
              )}
            </Collapsible.Content>

            {adding ? (
              <div className="mt-4 space-y-2">
                <input
                  className={`w-full rounded-md border p-2 text-sm focus:outline-none focus:border-teal-500 ${
                    isMeisterTask
                      ? 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white'
                      : 'bg-zinc-800 border-zinc-700 text-white'
                  }`}
                  placeholder="Task title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                  className={`w-full rounded-md border p-2 text-sm h-16 focus:outline-none focus:border-teal-500 ${
                    isMeisterTask
                      ? 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white'
                      : 'bg-zinc-800 border-zinc-700 text-white'
                  }`}
                  placeholder="Description (optional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTask}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 rounded-md transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setAdding(false);
                      setNewTitle("");
                      setNewDesc("");
                    }}
                    className={`flex-1 text-xs py-2 rounded-md transition-colors ${
                      isMeisterTask
                        ? 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-white'
                        : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className={`mt-4 w-full flex items-center justify-center gap-1 text-xs transition-colors ${
                  isMeisterTask
                    ? 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Plus className="w-3 h-3" /> Add task
              </button>
            )}
          </div>
        </Collapsible.Root>
      ) : (
        <div className="space-y-4">
          <SortableContext
            id={column.id}
            items={activeTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {loading ? (
              <div className={`text-sm ${isMeisterTask ? 'text-zinc-500' : 'text-zinc-400'}`}>Loading tasks...</div>
            ) : activeTasks.length === 0 ? (
              <div className={`text-sm ${isMeisterTask ? 'text-zinc-400' : 'text-zinc-500'}`}>No tasks</div>
            ) : (
              activeTasks.map((task: Task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onUpdated={refetch}
                  isMeisterTask={isMeisterTask}
                />
              ))
            )}
          </SortableContext>

          {adding ? (
            <div className="mt-4 space-y-2">
              <input
                className={`w-full rounded-md border p-2 text-sm focus:outline-none focus:border-teal-500 ${
                  isMeisterTask
                    ? 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white'
                    : 'bg-zinc-800 border-zinc-700 text-white'
                }`}
                placeholder="Task title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea
                className={`w-full rounded-md border p-2 text-sm h-16 focus:outline-none focus:border-teal-500 ${
                  isMeisterTask
                    ? 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white'
                    : 'bg-zinc-800 border-zinc-700 text-white'
                }`}
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddTask}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 rounded-md transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setAdding(false);
                    setNewTitle("");
                    setNewDesc("");
                  }}
                  className={`flex-1 text-xs py-2 rounded-md transition-colors ${
                    isMeisterTask
                      ? 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-white'
                      : 'bg-zinc-700 hover:bg-zinc-600 text-white'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className={`mt-4 w-full flex items-center justify-center gap-1 text-xs transition-colors ${
                isMeisterTask
                  ? 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              <Plus className="w-3 h-3" /> Add task
            </button>
          )}
        </div>
      )}
      
      {!isMeisterTask && (
        <DeleteConfirmationModal
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onConfirm={handleDeleteColumn}
          itemName={column.title}
          itemType="column"
          loading={deleting}
        />
      )}
    </div>
  );
}
