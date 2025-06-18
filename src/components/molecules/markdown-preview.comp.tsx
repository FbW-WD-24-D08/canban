import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarkdownPreview({ content, open, onOpenChange }: MarkdownPreviewProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1001]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-3xl h-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 p-6 shadow-lg z-[1002] flex flex-col">
          <Dialog.Close asChild>
            <button
              aria-label="Close"
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
          <div className="prose prose-invert prose-zinc max-w-none flex-1 overflow-y-auto mt-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 