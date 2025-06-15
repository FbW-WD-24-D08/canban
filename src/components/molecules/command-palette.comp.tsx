import * as Dialog from "@radix-ui/react-dialog";
import { useEffect } from "react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Groundwork for future command palette (Ctrl+K)
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  // Close on Escape automatically via Radix

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 p-4 shadow-lg">
          <Dialog.Title className="text-sm font-medium text-zinc-300 mb-2">Command Palette (WIP)</Dialog.Title>
          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Start typing a command…"
            autoFocus
          />
          <p className="text-xs text-zinc-500 mt-3">Coming soon: quick actions, navigation, create-task, etc.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 