import type { Tag } from "@/types/api.types";
import { X } from "lucide-react";
import { useState } from "react";

interface TagChipProps {
  tag: Tag;
  size?: "sm" | "md" | "lg";
  removable?: boolean;
  onRemove?: (tagId: string) => void;
  onClick?: (tag: Tag) => void;
  className?: string;
}

// MeisterTask-inspired tag colors
const TAG_COLORS = {
  red: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-200",
    border: "border-red-200 dark:border-red-700",
    hover: "hover:bg-red-200 dark:hover:bg-red-900/50",
    removeBg: "hover:bg-red-500 hover:text-white"
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30", 
    text: "text-orange-800 dark:text-orange-200",
    border: "border-orange-200 dark:border-orange-700",
    hover: "hover:bg-orange-200 dark:hover:bg-orange-900/50",
    removeBg: "hover:bg-orange-500 hover:text-white"
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-200", 
    border: "border-yellow-200 dark:border-yellow-700",
    hover: "hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
    removeBg: "hover:bg-yellow-500 hover:text-white"
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-200",
    border: "border-green-200 dark:border-green-700", 
    hover: "hover:bg-green-200 dark:hover:bg-green-900/50",
    removeBg: "hover:bg-green-500 hover:text-white"
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-200 dark:border-blue-700",
    hover: "hover:bg-blue-200 dark:hover:bg-blue-900/50", 
    removeBg: "hover:bg-blue-500 hover:text-white"
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-200",
    border: "border-purple-200 dark:border-purple-700",
    hover: "hover:bg-purple-200 dark:hover:bg-purple-900/50",
    removeBg: "hover:bg-purple-500 hover:text-white"
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-800 dark:text-pink-200", 
    border: "border-pink-200 dark:border-pink-700",
    hover: "hover:bg-pink-200 dark:hover:bg-pink-900/50",
    removeBg: "hover:bg-pink-500 hover:text-white"
  },
  gray: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-800 dark:text-zinc-200",
    border: "border-zinc-200 dark:border-zinc-700",
    hover: "hover:bg-zinc-200 dark:hover:bg-zinc-700",
    removeBg: "hover:bg-zinc-500 hover:text-white"
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-800 dark:text-teal-200",
    border: "border-teal-200 dark:border-teal-700",
    hover: "hover:bg-teal-200 dark:hover:bg-teal-900/50",
    removeBg: "hover:bg-teal-500 hover:text-white"
  }
} as const;

const SIZE_VARIANTS = {
  sm: {
    container: "px-2 py-0.5 text-xs",
    removeButton: "w-3 h-3 ml-1",
    removeIcon: "w-2 h-2"
  },
  md: {
    container: "px-2.5 py-1 text-sm", 
    removeButton: "w-4 h-4 ml-1.5",
    removeIcon: "w-2.5 h-2.5"
  },
  lg: {
    container: "px-3 py-1.5 text-base",
    removeButton: "w-5 h-5 ml-2", 
    removeIcon: "w-3 h-3"
  }
} as const;

export function TagChip({
  tag,
  size = "md",
  removable = false,
  onRemove,
  onClick,
  className = ""
}: TagChipProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Get color scheme - fallback to gray if color not found
  const colorKey = tag.color as keyof typeof TAG_COLORS;
  const colors = TAG_COLORS[colorKey] || TAG_COLORS.gray;
  const sizeConfig = SIZE_VARIANTS[size];
  
  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRemove || isRemoving) return;
    
    setIsRemoving(true);
    try {
      await onRemove(tag.id);
    } catch (error) {
      console.error("Failed to remove tag:", error);
      setIsRemoving(false);
    }
  };

  const handleClick = () => {
    if (onClick && !isRemoving) {
      onClick(tag);
    }
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        transition-all duration-200 ease-in-out
        ${colors.bg} ${colors.text} ${colors.border}
        ${onClick ? `cursor-pointer ${colors.hover}` : ''}
        ${sizeConfig.container}
        ${isRemoving ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        ${className}
      `}
      onClick={handleClick}
      title={tag.name}
    >
      <span className="truncate max-w-[120px]">
        {tag.name}
      </span>
      
      {removable && (
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className={`
            flex items-center justify-center rounded-full
            transition-all duration-150 ease-in-out
            ${sizeConfig.removeButton}
            ${colors.removeBg}
            ${isRemoving ? 'opacity-50 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}
          `}
          title="Remove tag"
          aria-label={`Remove ${tag.name} tag`}
        >
          <X className={sizeConfig.removeIcon} />
        </button>
      )}
    </span>
  );
}

// Tag Group Component for displaying multiple tags
interface TagGroupProps {
  tags: Tag[];
  size?: "sm" | "md" | "lg";
  maxVisible?: number;
  removable?: boolean;
  onRemoveTag?: (tagId: string) => void;
  onTagClick?: (tag: Tag) => void;
  className?: string;
}

export function TagGroup({
  tags,
  size = "md", 
  maxVisible = 5,
  removable = false,
  onRemoveTag,
  onTagClick,
  className = ""
}: TagGroupProps) {
  const visibleTags = tags.slice(0, maxVisible);
  const hiddenCount = Math.max(0, tags.length - maxVisible);

  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {visibleTags.map((tag) => (
        <TagChip
          key={tag.id}
          tag={tag}
          size={size}
          removable={removable}
          onRemove={onRemoveTag}
          onClick={onTagClick}
        />
      ))}
      
      {hiddenCount > 0 && (
        <span 
          className={`
            inline-flex items-center rounded-full border font-medium
            bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400
            border-zinc-200 dark:border-zinc-700
            ${SIZE_VARIANTS[size].container}
          `}
          title={`${hiddenCount} more tags`}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
} 