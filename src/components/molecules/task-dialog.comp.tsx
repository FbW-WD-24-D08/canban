import { tasksApi } from "@/api/tasks.api";
import type { Task } from "@/types/api.types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React, { useState } from "react";

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
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(
    (task.status as any) || "todo"
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const save = async () => {
    if (!title.trim()) return;
    try {
      setSaving(true);
      // Convert selected files to base64 metadata objects
      const attachments = await Promise.all(
        files.map(async (file) => {
          const reader = new FileReader();
          const result: string = await new Promise((res) => {
            reader.onload = () => res(reader.result as string);
            reader.readAsDataURL(file);
          });
          return {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            data: result,
          };
        })
      );

      await tasksApi.updateTask(task.id, {
        title,
        description: desc,
        status,
        attachments: attachments.length > 0 ? attachments : undefined,
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
              {task.attachments && task.attachments.length > 0 && (
                <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto text-[11px] text-teal-200">
                  {task.attachments.map((att) => (
                    <li key={att.id} className="flex items-center gap-1">
                      📎
                      <a
                        href={att.data || "#"}
                        download={att.name}
                        className="hover:underline whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {att.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {files.length > 0 && (
                <ul className="mt-2 space-y-1 max-h-24 overflow-y-auto text-[11px] text-teal-200">
                  {files.map((f) => (
                    <li key={f.name}>{f.name}</li>
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
  );
}
