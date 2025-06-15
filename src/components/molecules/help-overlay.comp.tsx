import * as Dialog from "@radix-ui/react-dialog";

interface HelpOverlayProps {
  onClose: () => void;
}

export function HelpOverlay({ onClose }: HelpOverlayProps) {
  return (
    <Dialog.Root open onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 p-6 shadow-lg z-50 text-sm text-zinc-200 space-y-4">
        <Dialog.Title className="text-xl font-semibold text-white mb-2">Keyboard Shortcuts</Dialog.Title>
        <ul className="space-y-2 list-disc list-inside">
          <li>
            <kbd className="px-2 py-1 rounded bg-zinc-800 text-zinc-100 text-xs mr-2">?</kbd>
            Toggle this help overlay
          </li>
          <li>
            <kbd className="px-2 py-1 rounded bg-zinc-800 text-zinc-100 text-xs mr-2">Enter</kbd> on focused card – Open edit dialog
          </li>
          <li>
            <kbd className="px-2 py-1 rounded bg-zinc-800 text-zinc-100 text-xs mr-2">Del</kbd> inside dialog – Delete task
          </li>
          <li>
            <kbd className="px-2 py-1 rounded bg-zinc-800 text-zinc-100 text-xs mr-2">A</kbd> on card in Done column – Archive task
          </li>
          <li>
            <kbd className="px-2 py-1 rounded bg-zinc-800 text-zinc-100 text-xs mr-2">R</kbd> on archived card – Restore task
          </li>
          <li>
            <kbd className="px-2 py-1 rounded bg-zinc-800 text-zinc-100 text-xs mr-2">N</kbd> on column – start adding new task
          </li>
        </ul>
        <div className="text-right mt-4">
          <Dialog.Close asChild>
            <button className="px-4 py-2 rounded-md bg-teal-600 text-white text-sm hover:bg-teal-700">Close</button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
} 