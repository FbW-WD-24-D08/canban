import { tasksApi } from "@/api/tasks.api";
import type { Task } from "@/types/api.types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Paperclip } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { AvatarGroup } from "../atoms/avatar.comp";
import { ChecklistProgress } from "../atoms/checklist-progress.comp";
import { DueDateIndicator } from "../atoms/due-date-indicator.comp";
import { PriorityBadge } from "../atoms/priority-badge.comp";
import { TaskDialog } from "./task-dialog.comp";

interface TaskCardProps {
  task: Task;
  onUpdated?: () => void;
  isDoneColumn?: boolean;
  isArchived?: boolean;
  isMeisterTask?: boolean;
}

export function TaskCard({ 
  task, 
  onUpdated, 
  isDoneColumn = false, 
  isArchived = false,
  isMeisterTask = false 
}: TaskCardProps) {
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_archiving, setArchiving] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    data: { columnId: task.columnId, task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const archiveTaskAction = async () => {
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

  const restoreTaskAction = async () => {
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

  const archiveTask = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    archiveTaskAction();
  };

  const restoreTask = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    restoreTaskAction();
  };

  const statusMap: Record<string, string> = {
    todo: "bg-zinc-700/20 text-zinc-300",
    "in-progress": "bg-yellow-600/20 text-yellow-400",
    done: "bg-green-600/20 text-green-400",
  };

  const statusKey = task.status ?? "todo";

  // Keep the original beautiful styling that you loved
  const cardBg = isMeisterTask 
    ? "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 shadow-sm hover:shadow-md" 
    : "bg-zinc-800/80 border border-zinc-700 hover:border-teal-500";
    
  const textColor = isMeisterTask 
    ? "text-zinc-900 dark:text-white" 
    : "text-white";
    
  const descColor = isMeisterTask 
    ? "text-zinc-600 dark:text-zinc-400" 
    : "text-zinc-400";

  // Mock assignees for demo - will be replaced with real data
  const mockAssignees = [
    { name: "John Doe", imageUrl: undefined },
    { name: "Alice Smith", imageUrl: undefined },
    ...(task.assignees || []).map(assignee => ({ name: assignee, imageUrl: undefined }))
  ];

  const checklistItems = task.checklistItems || [];
  const checklistTotal = checklistItems.length;
  const checklistCompleted = checklistItems.filter(item => item.completed).length;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter") {
            setOpen(true);
          }
          if (!isArchived && isDoneColumn && e.key.toLowerCase() === "a") {
            archiveTask(e);
          }
          if (isArchived && e.key.toLowerCase() === "r") {
            restoreTask(e);
          }
        }}
        className={`${cardBg} rounded-lg p-4 text-sm ${textColor} focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 cursor-pointer select-none group hover:scale-[1.02]`}
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
      >
        {/* Header row with badges and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Priority badge for MeisterTask boards */}
            {isMeisterTask && (
              <PriorityBadge 
                priority={task.priority || "medium"} 
                size="md" 
                showTooltip={true}
              />
            )}
            
            {/* Status badge for non-MeisterTask boards */}
            {!isMeisterTask && (
              <>
                {isArchived ? (
                  <span className="px-2 py-[1px] rounded bg-zinc-700/40 text-zinc-400 text-[10px] uppercase">
                    Archived
                  </span>
                ) : (
                  <span
                    className={`px-2 py-[1px] rounded text-[10px] uppercase ${
                      statusMap[statusKey] || "bg-zinc-700/20 text-zinc-300"
                    }`}
                  >
                    {statusKey}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button 
                  title="More actions" 
                  aria-label="More actions" 
                  className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                    isMeisterTask 
                      ? "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300" 
                      : "text-zinc-400 hover:text-zinc-200"
                  } focus:outline-none focus:opacity-100`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className={`min-w-[140px] rounded-md border p-1 shadow-lg ${
                  isMeisterTask 
                    ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" 
                    : "bg-zinc-800 border-zinc-700"
                }`}>
                  <DropdownMenu.Item
                    onSelect={() => setOpen(true)}
                    className={`px-2 py-1 text-sm rounded-sm cursor-pointer ${
                      isMeisterTask 
                        ? "text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700" 
                        : "text-zinc-200 hover:bg-zinc-700"
                    }`}
                  >
                    Edit…
                  </DropdownMenu.Item>
                  {!isArchived && (
                    <DropdownMenu.Item
                      onSelect={archiveTaskAction}
                      className={`px-2 py-1 text-sm rounded-sm cursor-pointer ${
                        isMeisterTask 
                          ? "text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700" 
                          : "text-zinc-200 hover:bg-zinc-700"
                      }`}
                    >
                      Archive
                    </DropdownMenu.Item>
                  )}
                  {isArchived && (
                    <DropdownMenu.Item
                      onSelect={restoreTaskAction}
                      className={`px-2 py-1 text-sm rounded-sm cursor-pointer ${
                        isMeisterTask 
                          ? "text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700" 
                          : "text-zinc-200 hover:bg-zinc-700"
                      }`}
                    >
                      Restore
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Item
                    onSelect={() => setOpen(true)}
                    className={`px-2 py-1 text-sm rounded-sm cursor-pointer ${
                      isMeisterTask 
                        ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                        : "text-red-400 hover:bg-zinc-700"
                    }`}
                  >
                    Delete…
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Task title */}
        <h4 className={`font-medium mb-3 line-clamp-2 ${textColor} text-base leading-tight`}>
          {task.title}
        </h4>

        {/* Task description */}
        {task.description && (
          <p className={`text-sm ${descColor} line-clamp-2 mb-3 leading-relaxed`}>
            {task.description}
          </p>
        )}

        {/* MeisterTask Enhanced Layout vs Regular Layout */}
        {isMeisterTask ? (
          <div className="space-y-3">
            {/* Avatars and Due Date Row */}
            <div className="flex items-center justify-between">
              <AvatarGroup 
                assignees={mockAssignees}
                maxVisible={2}
                size="xs"
              />
              
              <DueDateIndicator 
                dueDate={task.dueDate}
                completed={task.status === "completed"}
                size="sm"
              />
            </div>

            {/* Meta Information Row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {/* Attachments */}
                {task.attachments && task.attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                    <Paperclip className="w-3 h-3" />
                    <span className="font-medium">{task.attachments.length}</span>
                  </div>
                )}
                
                <ChecklistProgress 
                  completed={checklistCompleted}
                  total={checklistTotal}
                  size="sm"
                />
              </div>

              {/* Right side meta */}
              <div className="flex items-center gap-2">
                {/* Time tracking */}
                {task.estimatedHours && (
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <span>⏱️</span>
                    <span>{task.estimatedHours}h</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar for Checklist */}
            {checklistTotal > 0 && (
              <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    checklistCompleted === checklistTotal 
                      ? "bg-green-500" 
                      : "bg-teal-500"
                  }`}
                  style={{ width: `${(checklistCompleted / checklistTotal) * 100}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          /* Regular Layout - Keep original simple design */
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-teal-400">
                  <Paperclip className="w-3 h-3" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
            </div>

            {/* Right side meta */}
            <div className="flex items-center gap-2">
              {/* Legacy assignee display */}
              <span className="flex items-center gap-1 text-zinc-500">
                🧑‍🤝‍🧑 0
              </span>
            </div>
          </div>
        )}
      </div>
      
      <TaskDialog 
        task={task} 
        open={open} 
        onOpenChange={setOpen} 
        onSaved={onUpdated} 
        onDeleted={onUpdated}
        isMeisterTask={isMeisterTask}
      />
    </>
  );
} 