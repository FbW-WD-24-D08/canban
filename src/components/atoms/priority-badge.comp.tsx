import type { Priority } from "@/types/api.types";
import * as Tooltip from "@radix-ui/react-tooltip";

interface PriorityBadgeProps {
  priority?: Priority;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

// MeisterTask priority color mapping
const PRIORITY_CONFIG = {
  urgent: {
    color: "#F44336",
    bgColor: "#F4433620",
    label: "Urgent Priority",
    textColor: "#F44336",
  },
  high: {
    color: "#FF9800", 
    bgColor: "#FF980020",
    label: "High Priority",
    textColor: "#FF9800",
  },
  medium: {
    color: "#FFC107",
    bgColor: "#FFC10720", 
    label: "Medium Priority",
    textColor: "#FFC107",
  },
  low: {
    color: "#4CAF50",
    bgColor: "#4CAF5020",
    label: "Low Priority", 
    textColor: "#4CAF50",
  },
} as const;

// Size configurations
const SIZE_CONFIG = {
  sm: {
    circle: "w-2 h-2",
    container: "w-2 h-2",
  },
  md: {
    circle: "w-3 h-3", 
    container: "w-3 h-3",
  },
  lg: {
    circle: "w-4 h-4",
    container: "w-4 h-4", 
  },
} as const;

export function PriorityBadge({ 
  priority = "medium", 
  size = "md",
  showTooltip = true,
  className = "" 
}: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  const sizeConfig = SIZE_CONFIG[size];
  
  if (!priority) {
    return null;
  }

  const BadgeElement = (
    <div 
      className={`${sizeConfig.container} ${className} flex items-center justify-center`}
      aria-label={config.label}
    >
      <div
        className={`${sizeConfig.circle} rounded-full border-2 transition-all duration-200 hover:scale-110`}
        style={{
          backgroundColor: config.color,
          borderColor: config.color,
          boxShadow: `0 0 0 2px ${config.bgColor}`,
        }}
      />
    </div>
  );

  if (!showTooltip) {
    return BadgeElement;
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {BadgeElement}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="px-2 py-1 text-xs rounded-md shadow-lg border z-50"
            style={{
              backgroundColor: config.color,
              color: "white",
              borderColor: config.color,
            }}
            sideOffset={5}
          >
            {config.label}
            <Tooltip.Arrow 
              className="fill-current"
              style={{ color: config.color }}
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// Priority selector component for forms
interface PrioritySelectorProps {
  value?: Priority;
  onChange: (priority: Priority) => void;
  className?: string;
}

export function PrioritySelector({ 
  value = "medium", 
  onChange, 
  className = "" 
}: PrioritySelectorProps) {
  const priorities: Priority[] = ["low", "medium", "high", "urgent"];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">Priority:</span>
      <div className="flex items-center gap-1">
        {priorities.map((priority) => (
          <button
            key={priority}
            type="button"
            onClick={() => onChange(priority)}
            className={`p-1 rounded-md transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              value === priority ? "bg-zinc-100 dark:bg-zinc-800 ring-2 ring-teal-500" : ""
            }`}
            aria-label={`Set ${priority} priority`}
          >
            <PriorityBadge priority={priority} size="md" showTooltip={true} />
          </button>
        ))}
      </div>
    </div>
  );
} 