import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName?: string;
}

export function ImagePreview({ src, open, onOpenChange, fileName }: ImagePreviewProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1001]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-4xl h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-4 shadow-lg z-[1002] flex flex-col">
          <div className="flex items-center justify-between mb-2 text-white">
            <Dialog.Title className="text-sm font-medium text-zinc-300 truncate">
              {fileName || "Image Preview"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
            <img
              src={src}
              alt={fileName || "Attachment Preview"}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 