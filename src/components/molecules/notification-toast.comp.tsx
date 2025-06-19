import * as Toast from "@radix-ui/react-toast";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useState } from "react";

export interface ToastNotification {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface NotificationToastProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
}

export function NotificationToast({ notifications, onRemove }: NotificationToastProps) {
  const getIcon = (variant: ToastNotification["variant"]) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-teal-400" />;
    }
  };

  const getToastStyles = (variant: ToastNotification["variant"]) => {
    switch (variant) {
      case "success":
        return "border-green-500/20 bg-green-500/10";
      case "error":
        return "border-red-500/20 bg-red-500/10";
      case "warning":
        return "border-amber-500/20 bg-amber-500/10";
      case "info":
      default:
        return "border-teal-500/20 bg-teal-500/10";
    }
  };

  return (
    <Toast.Provider swipeDirection="right" duration={5000}>
      {notifications.map((notification) => (
        <Toast.Root
          key={notification.id}
          className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full ${getToastStyles(notification.variant)} bg-zinc-900/95 backdrop-blur-sm border-zinc-700`}
          duration={notification.duration}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.variant)}
            </div>
            <div className="flex-1 min-w-0">
              <Toast.Title className="text-sm font-medium text-white">
                {notification.title}
              </Toast.Title>
              {notification.description && (
                <Toast.Description className="mt-1 text-sm text-zinc-400">
                  {notification.description}
                </Toast.Description>
              )}
            </div>
          </div>
          <Toast.Close
            onClick={() => onRemove(notification.id)}
            className="flex-shrink-0 rounded-md p-1 text-zinc-400 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X className="w-4 h-4" />
          </Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </Toast.Provider>
  );
}

// Hook for managing toast notifications
export function useToast() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addNotification = (notification: Omit<ToastNotification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const success = (title: string, description?: string) => {
    addNotification({ title, description, variant: "success" });
  };

  const error = (title: string, description?: string) => {
    addNotification({ title, description, variant: "error" });
  };

  const info = (title: string, description?: string) => {
    addNotification({ title, description, variant: "info" });
  };

  const warning = (title: string, description?: string) => {
    addNotification({ title, description, variant: "warning" });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning,
  };
} 