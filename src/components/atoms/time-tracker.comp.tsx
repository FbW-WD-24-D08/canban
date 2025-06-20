import { formatDuration } from "@/lib/date-utils";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Clock, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface TimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in hours
  description?: string;
  date: string; // YYYY-MM-DD format
}

interface TimeTrackerProps {
  estimatedHours?: number;
  actualHours?: number;
  timeEntries?: TimeEntry[];
  onEstimateChange?: (hours: number | undefined) => void;
  onTimeLog?: (entry: TimeEntry) => void;
  onTimeUpdate?: (totalHours: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  showEstimate?: boolean;
  showActual?: boolean;
  showTracker?: boolean;
  isCompact?: boolean;
}

// Smart time parsing function
function parseTimeInput(input: string): number | null {
  if (!input.trim()) return null;
  
  const cleanInput = input.toLowerCase().trim();
  
  // Handle formats like "2h 30m", "1.5h", "90m", "2:30"
  const patterns = [
    // "2h 30m" or "2h30m"
    /^(\d+(?:\.\d+)?)h\s*(\d+(?:\.\d+)?)m$/,
    // "2h" 
    /^(\d+(?:\.\d+)?)h$/,
    // "90m"
    /^(\d+(?:\.\d+)?)m$/,
    // "2:30" (hours:minutes)
    /^(\d+):(\d+)$/,
    // "1.5" (decimal hours)
    /^(\d+(?:\.\d+)?)$/
  ];
  
  // Try "2h 30m" format
  let match = cleanInput.match(patterns[0]);
  if (match) {
    const hours = parseFloat(match[1]);
    const minutes = parseFloat(match[2]);
    return hours + (minutes / 60);
  }
  
  // Try "2h" format
  match = cleanInput.match(patterns[1]);
  if (match) {
    return parseFloat(match[1]);
  }
  
  // Try "90m" format
  match = cleanInput.match(patterns[2]);
  if (match) {
    return parseFloat(match[1]) / 60;
  }
  
  // Try "2:30" format
  match = cleanInput.match(patterns[3]);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    return hours + (minutes / 60);
  }
  
  // Try decimal format
  match = cleanInput.match(patterns[4]);
  if (match) {
    return parseFloat(match[1]);
  }
  
  return null;
}

// Time input component
interface TimeInputProps {
  value?: number;
  onChange: (hours: number | undefined) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

function TimeInput({ value, onChange, placeholder = "e.g. 2h 30m", className = "", size = "md" }: TimeInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isValid, setIsValid] = useState(true);
  
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(formatDuration(value));
    } else {
      setInputValue("");
    }
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (!newValue.trim()) {
      onChange(undefined);
      setIsValid(true);
      return;
    }
    
    const parsed = parseTimeInput(newValue);
    if (parsed !== null) {
      onChange(parsed);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2"
  };
  
  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={`
        ${sizeClasses[size]} w-full
        border rounded-lg bg-white dark:bg-zinc-800
        text-zinc-900 dark:text-white
        placeholder-zinc-500 dark:placeholder-zinc-400
        focus:outline-none transition-all duration-200
        ${isValid 
          ? "border-zinc-300 dark:border-zinc-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" 
          : "border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
        }
        ${className}
      `}
    />
  );
}

export function TimeTracker({
  estimatedHours,
  actualHours = 0,
  timeEntries = [],
  onEstimateChange,
  onTimeLog,
  onTimeUpdate,
  className = "",
  size = "md",
  showEstimate = true,
  showActual = true,
  showTracker = true,
  isCompact = false
}: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentSession, setCurrentSession] = useState(0); // hours
  const [showEstimateInput, setShowEstimateInput] = useState(false);
  
  // Calculate progress
  const progress = estimatedHours ? Math.min((actualHours / estimatedHours) * 100, 100) : 0;
  const isOverBudget = estimatedHours ? actualHours > estimatedHours : false;
  
  // Update current session time
  useEffect(() => {
    if (!isTracking || !startTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
      setCurrentSession(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isTracking, startTime]);
  
  const handleStartTracking = () => {
    const now = new Date();
    setStartTime(now);
    setIsTracking(true);
    setCurrentSession(0);
  };
  
  const handleStopTracking = () => {
    if (!startTime) return;
    
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
    
    if (duration > 0) {
      const entry: TimeEntry = {
        id: `${Date.now()}`,
        startTime,
        endTime,
        duration,
        date: new Date().toISOString().split('T')[0]
      };
      
      onTimeLog?.(entry);
      onTimeUpdate?.(actualHours + duration);
    }
    
    setIsTracking(false);
    setStartTime(null);
    setCurrentSession(0);
  };
  
  const handleQuickAdd = (hours: number) => {
    const entry: TimeEntry = {
      id: `${Date.now()}`,
      startTime: new Date(),
      duration: hours,
      date: new Date().toISOString().split('T')[0]
    };
    
    onTimeLog?.(entry);
    onTimeUpdate?.(actualHours + hours);
  };
  
  const totalDisplayHours = actualHours + currentSession;
  
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };
  
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };
  
  if (isCompact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock className={`${iconSizes[size]} text-zinc-500 dark:text-zinc-400`} />
        <span className={`${sizeClasses[size]} text-zinc-600 dark:text-zinc-400`}>
          {formatDuration(totalDisplayHours)}
          {estimatedHours && (
            <span className="text-zinc-500 dark:text-zinc-500">
              /{formatDuration(estimatedHours)}
            </span>
          )}
        </span>
        {isTracking && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
    );
  }
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Estimate Section */}
      {showEstimate && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`${sizeClasses[size]} text-zinc-600 dark:text-zinc-400 font-medium`}>
              Estimated Time
            </label>
            {!showEstimateInput && (
              <button
                onClick={() => setShowEstimateInput(true)}
                className={`${sizeClasses[size]} text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300`}
              >
                {estimatedHours ? 'Edit' : 'Add estimate'}
              </button>
            )}
          </div>
          
          {showEstimateInput ? (
            <div className="flex items-center gap-2">
              <TimeInput
                value={estimatedHours}
                onChange={onEstimateChange || (() => {})}
                placeholder="e.g., 2h 30m"
                size={size === "lg" ? "md" : size === "sm" ? "sm" : "md"}
              />
              <button
                onClick={() => setShowEstimateInput(false)}
                className={`px-3 py-1 ${sizeClasses[size]} bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors`}
              >
                Save
              </button>
            </div>
          ) : (
            <div className={`${sizeClasses[size]} text-zinc-900 dark:text-white font-medium`}>
              {estimatedHours ? formatDuration(estimatedHours) : 'No estimate'}
            </div>
          )}
        </div>
      )}
      
      {/* Progress Bar */}
      {estimatedHours && showActual && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className={`${sizeClasses[size]} text-zinc-600 dark:text-zinc-400`}>
              Progress
            </span>
            <span className={`${sizeClasses[size]} font-medium ${
              isOverBudget 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-zinc-900 dark:text-white'
            }`}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isOverBudget 
                  ? 'bg-red-500' 
                  : progress > 75 
                    ? 'bg-yellow-500' 
                    : 'bg-teal-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Actual Time Section */}
      {showActual && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`${sizeClasses[size]} text-zinc-600 dark:text-zinc-400 font-medium`}>
              Time Logged
            </label>
            <div className={`${sizeClasses[size]} font-medium text-zinc-900 dark:text-white`}>
              {formatDuration(totalDisplayHours)}
            </div>
          </div>
          
          {/* Quick Add Buttons */}
          <div className="flex items-center gap-2">
            <Tooltip.Provider delayDuration={300}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => handleQuickAdd(0.25)}
                    className={`px-2 py-1 ${sizeClasses[size]} bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors`}
                  >
                    +15m
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="px-2 py-1 text-xs bg-zinc-900 text-white rounded shadow-lg">
                    Add 15 minutes
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
            
            <button
              onClick={() => handleQuickAdd(0.5)}
              className={`px-2 py-1 ${sizeClasses[size]} bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors`}
            >
              +30m
            </button>
            
            <button
              onClick={() => handleQuickAdd(1)}
              className={`px-2 py-1 ${sizeClasses[size]} bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors`}
            >
              +1h
            </button>
          </div>
        </div>
      )}
      
      {/* Time Tracker */}
      {showTracker && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`${sizeClasses[size]} text-zinc-600 dark:text-zinc-400 font-medium`}>
              Timer
            </label>
            {isTracking && (
              <div className={`${sizeClasses[size]} text-zinc-900 dark:text-white font-mono`}>
                {formatDuration(currentSession)}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isTracking ? (
              <button
                onClick={handleStartTracking}
                className={`flex items-center gap-2 px-3 py-2 ${sizeClasses[size]} bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors`}
              >
                <Play className={iconSizes[size]} />
                Start Timer
              </button>
            ) : (
              <button
                onClick={handleStopTracking}
                className={`flex items-center gap-2 px-3 py-2 ${sizeClasses[size]} bg-red-600 text-white rounded hover:bg-red-700 transition-colors`}
              >
                <Pause className={iconSizes[size]} />
                Stop Timer
              </button>
            )}
            
            {isTracking && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className={`${sizeClasses[size]} font-medium`}>Recording</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Time Entries Summary */}
      {timeEntries.length > 0 && (
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <div className={`${sizeClasses[size]} text-zinc-600 dark:text-zinc-400 mb-1`}>
            Recent Sessions ({timeEntries.length})
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {timeEntries.slice(-3).map((entry) => (
              <div key={entry.id} className={`flex items-center justify-between ${sizeClasses[size]} text-zinc-500 dark:text-zinc-400`}>
                <span>{entry.date}</span>
                <span className="font-mono">{formatDuration(entry.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact time display for cards
interface TimeDisplayProps {
  estimatedHours?: number;
  actualHours?: number;
  isTracking?: boolean;
  className?: string;
}

export function TimeDisplay({ estimatedHours, actualHours = 0, isTracking = false, className = "" }: TimeDisplayProps) {
  const progress = estimatedHours ? (actualHours / estimatedHours) * 100 : 0;
  const isOverBudget = estimatedHours ? actualHours > estimatedHours : false;
  
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className={`flex items-center gap-1 ${className}`}>
            <Clock className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
            <span className={`text-xs font-medium ${
              isOverBudget 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-zinc-600 dark:text-zinc-400'
            }`}>
              {formatDuration(actualHours)}
              {estimatedHours && (
                <span className="text-zinc-500 dark:text-zinc-500">
                  /{formatDuration(estimatedHours)}
                </span>
              )}
            </span>
            {isTracking && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="px-2 py-1 text-xs bg-zinc-900 text-white rounded shadow-lg">
            {actualHours > 0 && (
              <div>Logged: {formatDuration(actualHours)}</div>
            )}
            {estimatedHours && (
              <div>Estimated: {formatDuration(estimatedHours)}</div>
            )}
            {estimatedHours && (
              <div>Progress: {Math.round(progress)}%</div>
            )}
            {isTracking && (
              <div className="text-red-400">⏱️ Timer running</div>
            )}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
} 