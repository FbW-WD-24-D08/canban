import { boardsApi } from "@/api/boards.api";
import type { Board } from "@/types/api.types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  onBoardCreated?: (board: Board) => void;
}

export function CreateBoardDialog({
  open,
  onOpenChange,
  ownerId,
  onBoardCreated,
}: CreateBoardDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    try {
      setSaving(true);
      const newBoard = await boardsApi.createBoard({ title, description }, ownerId);
      onBoardCreated?.(newBoard);
      onOpenChange(false);
      // reset fields
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setError("Failed to create board");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content 
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 p-6 shadow-lg"
          aria-describedby="create-board-description"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-white">Create Board</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-zinc-400 hover:text-zinc-200" aria-label="Close">
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description id="create-board-description" className="sr-only">
            Create a new board with a title and optional description.
          </Dialog.Description>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 focus:border-teal-500 focus:outline-none"
                placeholder="Board title"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1" htmlFor="description">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white p-2 h-24 resize-none focus:border-teal-500 focus:outline-none"
                placeholder="Board description"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-zinc-700 text-sm text-white hover:bg-zinc-600"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-teal-600 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 