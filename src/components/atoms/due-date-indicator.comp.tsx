import * as Tooltip from "@radix-ui/react-tooltip";
import { AlertTriangle, Calendar, Clock } from "lucide-react";

interface DueDateIndicatorProps {
  dueDate?: string;
  completed?: boolean;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

// Helper function to format dates like MeisterTask
function formatDueDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Check if it's today
  if (taskDate.getTime() === today.getTime()) {
    return "Today";
  }

  // Check if it's tomorrow
  if (taskDate.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }

  // Check if it's this year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Different year
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Helper function to get due date status
function getDueDateStatus(dueDate: string, completed: boolean = false) {
  if (completed) {
    return {
      status: "completed",
      color: "#4CAF50",
      bgColor: "#4CAF5020",
      textColor: "#4CAF50",
      icon: Calendar,
    };
  }

  const now = new Date();
  const due = new Date(dueDate);
  const diffInHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 0) {
    // Overdue
    return {
      status: "overdue",
      color: "#F44336",
      bgColor: "#F4433620",
      textColor: "#F44336",
      icon: AlertTriangle,
    };
  } else if (diffInHours < 24) {
    // Due soon (within 24 hours)
    return {
      status: "due-soon",
      color: "#FF9800",
      bgColor: "#FF980020",
      textColor: "#FF9800",
      icon: Clock,
    };
  } else {
    // Normal
    return {
      status: "normal",
      color: "#9E9E9E",
      bgColor: "#9E9E9E20",
      textColor: "#9E9E9E",
      icon: Calendar,
    };
  }
}

export function DueDateIndicator({ 
  dueDate, 
  completed = false,
  size = "sm",
  showIcon = true,
  className = "" 
}: DueDateIndicatorProps) {
  if (!dueDate) {
    return null;
  }

  const dateStatus = getDueDateStatus(dueDate, completed);
  const formattedDate = formatDueDate(dueDate);
  const IconComponent = dateStatus.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  const DueDateElement = (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center gap-1 font-medium transition-all duration-200 ${className}`}
      style={{
        backgroundColor: dateStatus.bgColor,
        color: dateStatus.textColor,
      }}
    >
      {showIcon && <IconComponent className={iconSizes[size]} />}
      <span>{formattedDate}</span>
    </div>
  );

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {DueDateElement}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="px-2 py-1 text-xs rounded-md shadow-lg border z-50"
            style={{
              backgroundColor: dateStatus.color,
              color: "white",
              borderColor: dateStatus.color,
            }}
            sideOffset={5}
          >
            {dateStatus.status === "overdue" && "Overdue"}
            {dateStatus.status === "due-soon" && "Due soon"}
            {dateStatus.status === "normal" && "Due date"}
            {dateStatus.status === "completed" && "Completed"}
            {" - "}
            {new Date(dueDate).toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
            <Tooltip.Arrow 
              className="fill-current"
              style={{ color: dateStatus.color }}
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// Date picker component for forms
interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className = "" }: DatePickerProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    onChange(dateValue || undefined);
  };

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm text-zinc-600 dark:text-zinc-400">Due date:</label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={formatDateForInput(value)}
          onChange={handleDateChange}
          className="px-2 py-1 text-sm border rounded-md bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white focus:border-teal-500 focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
} 