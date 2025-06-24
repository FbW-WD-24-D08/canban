import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import { useRef, type ReactNode } from "react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  loading = false,
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <Trash2 className="w-6 h-6 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      case "info":
        return <Info className="w-6 h-6 text-teal-400" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-amber-400" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (variant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500";
      case "info":
        return "bg-teal-600 hover:bg-teal-700 focus:ring-teal-500";
      default:
        return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500";
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in-0 duration-200" />
        <Dialog.Content
          initialFocus={cancelRef}
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl z-[9999] animate-in fade-in-0 zoom-in-95 duration-200"
        >
          
          {/* Header with Icon */}
          <div className="flex items-center gap-4 p-6 pb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-lg font-semibold text-white mb-1">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-zinc-400 leading-relaxed">
                {description}
              </Dialog.Description>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 pt-2 border-t border-zinc-800/50">
            <Dialog.Close asChild>
              <button
                ref={cancelRef}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-sm font-medium hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {cancelText}
              </button>
            </Dialog.Close>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${getConfirmButtonStyle()}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Specialized confirmation modals for common use cases
export function DeleteConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemType = "item",
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
  loading?: boolean;
}) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={`Delete ${itemType}`}
      description={
        <>
          Are you sure you want to delete <span className="font-medium text-white">"{itemName}"</span>?
          <br />
          <span className="text-xs text-red-400">
            This action cannot be undone.
          </span>
        </>
      }
      confirmText="Delete"
      variant="danger"
      loading={loading}
    />
  );
}

export function RemoveMemberModal({
  open,
  onOpenChange,
  onConfirm,
  memberName,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  memberName: string;
  loading?: boolean;
}) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Remove member"
      description={
        <>
          Remove <span className="font-medium text-white">{memberName}</span> from this board?
          <br />
          <span className="text-xs text-zinc-500">
            They will lose access to this board and all its content.
          </span>
        </>
      }
      confirmText="Remove"
      variant="warning"
      loading={loading}
    />
  );
} 