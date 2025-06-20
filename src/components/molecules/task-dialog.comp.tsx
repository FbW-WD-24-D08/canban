import { tasksApi } from "@/api/tasks.api";
import { previewCache } from "@/lib/preview-cache";
import type { Priority, Tag, Task } from "@/types/api.types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React, { useState } from "react";
import { DatePicker } from "../atoms/due-date-indicator.comp";
import { PrioritySelector } from "../atoms/priority-badge.comp";
import { useToast } from "../contexts/toast.context.tsx";
import { DeleteConfirmationModal } from "./confirmation-modal.comp.tsx";
import { TagSelector } from "./tag-selector.comp";
import { UniversalFilePreview } from "./universal-file-preview.comp.tsx";

interface TaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
  onDeleted?: () => void;
  isMeisterTask?: boolean;
}

export function TaskDialog({ 
  task, 
  open, 
  onOpenChange, 
  onSaved, 
  onDeleted,
  isMeisterTask = false 
}: TaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(
    (task.status as any) || "todo"
  );
  const [priority, setPriority] = useState<Priority>(task.priority || "medium");
  const [dueDate, setDueDate] = useState<string | undefined>(task.dueDate);
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [filePreview, setFilePreview] = useState<{ data: string; name: string; type: string; attachmentId: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toast = useToast();

  // Tag management for MeisterTask boards
  const getTagColor = (tagName: string): string => {
    const colorMap: Record<string, string> = {
      'Frontend': 'blue',
      'Backend': 'green', 
      'Design': 'purple',
      'UI/UX': 'pink',
      'Security': 'red',
      'API': 'orange',
      'Testing': 'yellow',
      'Mobile': 'teal',
      'UX': 'pink',
      'Performance': 'green',
      'Database': 'gray',
      'Onboarding': 'blue'
    };
    return colorMap[tagName] || 'gray';
  };

  // Convert string tags to Tag objects
  const stringToTag = (tagName: string): Tag => ({
    id: tagName,
    name: tagName,
    color: getTagColor(tagName),
    boardId: '14e1'
  });

  // Available tags (in a real app, this would come from an API)
  const availableTags: Tag[] = [
    'Frontend', 'Backend', 'Design', 'UI/UX', 'Security', 'API', 
    'Testing', 'Mobile', 'UX', 'Performance', 'Database', 'Onboarding',
    'Bug', 'Feature', 'Enhancement', 'Documentation', 'Refactor'
  ].map(stringToTag);

  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    (task.tags || []).map(stringToTag)
  );

  const handleTagSelect = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagDeselect = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };

  const handleCreateTag = async (name: string, color: string): Promise<Tag> => {
    // In a real app, this would call an API to create the tag
    const newTag: Tag = {
      id: name,
      name,
      color,
      boardId: '14e1'
    };
    return newTag;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handlePreview = async (attachment: any) => {
    try {
      setSaving(true);
      const data = await previewCache.preparePreview(task.id, attachment, attachments);
      setFilePreview({
        data,
        name: attachment.name,
        type: attachment.type,
        attachmentId: attachment.id
      });
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error("Preview failed", `Could not preview file: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  const closePreview = async () => {
    if (filePreview) {
      try {
        await previewCache.cleanupPreview(task.id, filePreview.attachmentId, attachments);
      } catch (error) {
        console.error('Cleanup failed:', error);
      }
      setFilePreview(null);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
  };

  const save = async () => {
    if (!title.trim()) return;
    try {
      setSaving(true);

      // Process new files
      const newAttachments = await Promise.all(
        files.map(async (file) => {
          return await previewCache.handleFileSelection(file);
        })
      );

      const allAttachments = [...attachments, ...newAttachments];

      const updateData: any = {
        title,
        description: desc,
        status,
        attachments: allAttachments.length > 0 ? allAttachments : undefined,
      };

      // Add MeisterTask specific fields
      if (isMeisterTask) {
        updateData.priority = priority;
        updateData.dueDate = dueDate;
        updateData.tags = selectedTags.map(tag => tag.name);
      }

      await tasksApi.updateTask(task.id, updateData);
      
      setFiles([]);
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await tasksApi.deleteTask(task.id);
      toast.success("Task deleted", "The task has been permanently deleted.");
      onDeleted?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Delete failed", "Could not delete the task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Clean dark theme styling to match the main board
  const dialogBg = "bg-zinc-900";
  const titleColor = "text-white";
  const labelColor = "text-zinc-400";
  const inputBg = "bg-zinc-800 border-zinc-700";
  const inputText = "text-white";

  return (
    <>
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className={`fixed left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg ${dialogBg} p-6 shadow-lg border border-zinc-800`}>
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className={`text-lg font-semibold ${titleColor}`}>
              Edit Task
            </Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Edit task details including title, description, status, priority, and attachments.
          </Dialog.Description>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm ${labelColor} mb-1`}>Title</label>
              <input
                className={`w-full rounded-md ${inputBg} border ${inputText} p-2 text-sm focus:border-teal-500 focus:outline-none`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>
            
            <div>
              <label className={`block text-sm ${labelColor} mb-1`}>Description</label>
              <textarea
                className={`w-full h-24 rounded-md ${inputBg} border ${inputText} p-2 text-sm focus:border-teal-500 focus:outline-none`}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Description (optional)"
              />
            </div>

            {/* MeisterTask specific fields */}
            {isMeisterTask && (
              <div className="space-y-4">
                {/* Priority selector */}
                <div>
                  <PrioritySelector 
                    value={priority} 
                    onChange={setPriority}
                    className="mb-2"
                  />
                </div>
                
                {/* Due date picker */}
                <div>
                  <DatePicker
                    value={dueDate}
                    onChange={setDueDate}
                  />
                </div>

                {/* Tag selector */}
                <div>
                  <label className={`block text-sm ${labelColor} mb-2`}>Tags</label>
                  <TagSelector
                    selectedTags={selectedTags}
                    availableTags={availableTags}
                    onTagSelect={handleTagSelect}
                    onTagDeselect={handleTagDeselect}
                    onCreateTag={handleCreateTag}
                    maxTags={5}
                    placeholder="Search or create tags..."
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="file-input" className={`block text-sm ${labelColor} mb-1`}>Attachments</label>
              <input
                id="file-input"
                title="Add attachments"
                placeholder="Choose files"
                type="file"
                multiple
                onChange={handleFileChange}
                className={`w-full text-sm ${inputText} file:bg-teal-600 file:border-0 file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-teal-700`}
              />
              
              {/* Existing attachments */}
              {attachments.length > 0 && (
                <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto text-[11px] text-teal-200">
                  {attachments.map((att) => (
                    <li key={att.id} className="flex items-center gap-1">
                      📎
                      <button
                        onClick={() => handlePreview(att)}
                        className="hover:underline whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1"
                        disabled={saving}
                      >
                        {att.name}
                      </button>
                      <button
                        onClick={() => removeAttachment(att.id)}
                        className="text-red-400 hover:text-red-300 ml-2"
                        disabled={saving}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* New files preview */}
              {files.length > 0 && (
                <ul className="mt-2 space-y-1 max-h-24 overflow-y-auto text-[11px] text-teal-200">
                  {files.map((f) => (
                    <li key={f.name}>{f.name} (new)</li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Status selector - only for non-MeisterTask boards */}
            {!isMeisterTask && (
              <div>
                <label className={`block text-sm ${labelColor} mb-1`}>Status</label>
                <select
                  title="Task status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className={`w-full rounded-md ${inputBg} border ${inputText} p-2 text-sm focus:border-teal-500 focus:outline-none`}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded-md text-sm transition-colors bg-zinc-700 text-white hover:bg-zinc-600">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-red-600 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-teal-600 text-sm text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    
    {filePreview && (
      <UniversalFilePreview
        fileUrl={filePreview.data}
        fileName={filePreview.name}
        fileType={filePreview.type}
        open={!!filePreview}
        onOpenChange={closePreview}
      />
    )}
    
    <DeleteConfirmationModal
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      onConfirm={handleDelete}
      itemName={task.title}
      itemType="task"
      loading={saving}
    />
    </>
  );
}
