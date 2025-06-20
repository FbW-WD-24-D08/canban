import {
    formatSmartDate,
    getDateStatus,
    getDateSuggestions,
    parseNaturalDate
} from "@/lib/date-utils";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Calendar, Clock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SmartDateInputProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SmartDateInput({ 
  value, 
  onChange, 
  placeholder = "Type 'tomorrow', 'next friday', etc.",
  className = "",
  size = "md"
}: SmartDateInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ text: string; value: Date; description?: string }>>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update input value when prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setInputValue(formatSmartDate(date, { showRelative: true, shortFormat: true }));
    } else {
      setInputValue("");
    }
  }, [value]);
  
  // Update suggestions when input changes
  useEffect(() => {
    setSuggestions(getDateSuggestions(inputValue));
    setSelectedIndex(-1);
  }, [inputValue]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    
    // Try to parse the date immediately
    if (newValue.trim()) {
      const parsedDate = parseNaturalDate(newValue);
      if (parsedDate) {
        onChange(parsedDate.toISOString());
      }
    } else {
      onChange(undefined);
    }
  };
  
  // Handle suggestion selection
  const selectSuggestion = (suggestion: { text: string; value: Date }) => {
    setInputValue(suggestion.text);
    onChange(suggestion.value.toISOString());
    setShowSuggestions(false);
    inputRef.current?.blur();
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };
  
  // Clear date
  const clearDate = () => {
    setInputValue("");
    onChange(undefined);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  
  // Size variants
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3"
  };
  
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };
  
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 ${iconSizes[size]}`} />
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay hiding to allow suggestion clicks
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={placeholder}
          className={`
            ${sizeClasses[size]} pl-10 pr-8 w-full
            border border-zinc-300 dark:border-zinc-600 
            rounded-lg bg-white dark:bg-zinc-800
            text-zinc-900 dark:text-white
            placeholder-zinc-500 dark:placeholder-zinc-400
            focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none
            transition-all duration-200
          `}
        />
        
        {value && (
          <button
            type="button"
            onClick={clearDate}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors`}
          >
            <X className={iconSizes[size]} />
          </button>
        )}
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.text}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className={`
                w-full px-3 py-2 text-left text-sm
                hover:bg-zinc-50 dark:hover:bg-zinc-700
                flex items-center justify-between
                ${index === selectedIndex ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' : 'text-zinc-700 dark:text-zinc-300'}
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
                transition-colors duration-150
              `}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 opacity-60" />
                <span className="font-medium">{suggestion.text}</span>
              </div>
              {suggestion.description && (
                <span className="text-xs opacity-60">
                  {suggestion.description}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Smart date display component
interface SmartDateDisplayProps {
  date: string;
  completed?: boolean;
  showRelative?: boolean;
  className?: string;
}

export function SmartDateDisplay({ 
  date, 
  completed = false, 
  showRelative = true,
  className = "" 
}: SmartDateDisplayProps) {
  const dateObj = new Date(date);
  const status = getDateStatus(dateObj, completed);
  const displayText = formatSmartDate(dateObj, { showRelative, shortFormat: true });
  
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span 
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${className}`}
            style={{ 
              backgroundColor: status.bgColor,
              color: status.textColor
            }}
          >
            <Calendar className="w-3 h-3" />
            {displayText}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="px-2 py-1 text-xs rounded-md shadow-lg border z-50 text-white"
            style={{ backgroundColor: status.color, borderColor: status.color }}
            sideOffset={5}
          >
            {status.status === "overdue" && "Overdue"}
            {status.status === "due-soon" && "Due soon"}
            {status.status === "normal" && "Due date"}
            {status.status === "completed" && "Completed"}
            {" - "}
            {dateObj.toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
            <Tooltip.Arrow className="fill-current" style={{ color: status.color }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
} 