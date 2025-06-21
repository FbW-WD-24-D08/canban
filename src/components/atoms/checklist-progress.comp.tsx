import * as Tooltip from "@radix-ui/react-tooltip";
import { CheckSquare, Square } from "lucide-react";

interface ChecklistProgressProps {
  completed: number;
  total: number;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export function ChecklistProgress({ 
  completed, 
  total, 
  size = "sm", 
  showIcon = true,
  className = "" 
}: ChecklistProgressProps) {
  if (total === 0) {
    return null;
  }

  const percentage = Math.round((completed / total) * 100);
  const isComplete = completed === total;

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  const textColor = isComplete 
    ? "text-green-600 dark:text-green-400" 
    : "text-zinc-600 dark:text-zinc-400";

  const IconComponent = isComplete ? CheckSquare : Square;

  const ProgressElement = (
    <div className={`flex items-center gap-1 ${textColor} ${sizeClasses[size]} ${className}`}>
      {showIcon && <IconComponent className={iconSizes[size]} />}
      <span className="font-medium">{completed}/{total}</span>
    </div>
  );

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {ProgressElement}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="px-2 py-1 text-xs bg-zinc-900 text-white rounded-md shadow-lg border border-zinc-700 z-50"
            sideOffset={5}
          >
            Checklist: {completed} of {total} completed ({percentage}%)
            <Tooltip.Arrow className="fill-zinc-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// Mini progress bar for visual representation
interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export function MiniProgressBar({ completed, total, className = "" }: ProgressBarProps) {
  if (total === 0) {
    return null;
  }

  const percentage = (completed / total) * 100;
  const isComplete = completed === total;

  return (
    <div className={`w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden ${className}`}>
      <div 
        className={`h-full transition-all duration-300 ${
          isComplete 
            ? "bg-green-500" 
            : "bg-teal-500"
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
} 