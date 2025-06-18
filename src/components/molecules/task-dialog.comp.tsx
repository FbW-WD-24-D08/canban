import { tasksApi } from "@/api/tasks.api";
import type { Task } from "@/types/api.types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React, { useState } from "react";
import { UniversalFilePreview } from "./universal-file-preview.comp.tsx";
import { previewCache } from "@/lib/preview-cache";

interface TaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
  onDeleted?: () => void;
}

export function TaskDialog({ task, open, onOpenChange, onSaved, onDeleted }: TaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(
    (task.status as any) || "todo"
  );
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [filePreview, setFilePreview] = useState<{ data: string; name: string; type: string; attachmentId: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handlePreview = async (attachment: Attachment) => {
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
      alert(`Preview failed: ${error}`);
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

      await tasksApi.updateTask(task.id, {
        title,
        description: desc,
        status,
        attachments: allAttachments.length > 0 ? allAttachments : undefined,
      });
      
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
    const ok = window.confirm("Delete this task permanently? This cannot be undone.");
    if (!ok) return;
    try {
      setSaving(true);
      await tasksApi.deleteTask(task.id);
      onDeleted?.();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-white">Edit Task</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Edit task details including title, description, status, and attachments.
          </Dialog.Description>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Title</label>
              <input
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 text-sm focus:border-teal-500 focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Description</label>
              <textarea
                className="w-full h-24 rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 text-sm focus:border-teal-500 focus:outline-none"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Description (optional)"
              />
            </div>
            <div>
              <label htmlFor="file-input" className="block text-sm text-zinc-400 mb-1">Attachments</label>
              <input
                id="file-input"
                title="Add attachments"
                placeholder="Choose files"
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full text-sm text-zinc-200 file:bg-teal-600 file:border-0 file:px-3 file:py-1 file:text-sm file:text-white hover:file:bg-teal-700"
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
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Status</label>
              <select
                title="Task status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 text-sm focus:border-teal-500 focus:outline-none"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="px-4 py-2 rounded-md bg-zinc-700 text-sm text-white hover:bg-zinc-600">Cancel</button>
              </Dialog.Close>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-red-600 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-teal-600 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
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
    </>
  );
}
