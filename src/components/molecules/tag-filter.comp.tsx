import type { Tag } from "@/types/api.types";
import { Search } from "lucide-react";
import { useState } from "react";
import { TagChip } from "../atoms/tag-chip.comp";

interface TagFilterProps {
  availableTags: Tag[];
  selectedTags: Tag[];
  onTagSelect: (tag: Tag) => void;
  onTagDeselect: (tagId: string) => void;
  onClearAll: () => void;
  taskCounts?: Record<string, number>; // Number of tasks per tag
  className?: string;
}

export function TagFilter({
  availableTags,
  selectedTags,
  onTagSelect,
  onTagDeselect,
  onClearAll,
  taskCounts = {},
  className = ""
}: TagFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter available tags based on search
  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTags.find(selected => selected.id === tag.id)
  );

  const hasActiveFilters = selectedTags.length > 0;

  return (
    <div className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
          Filter by Tags
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected Tags */}
      {hasActiveFilters && (
        <div className="mb-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            Active filters ({selectedTags.length}):
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <TagChip
                key={tag.id}
                tag={tag}
                size="sm"
                removable
                onRemove={onTagDeselect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Toggle */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Search tags..."
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
        >
          {isExpanded ? 'Show less' : `Show all tags (${availableTags.length})`}
        </button>
      </div>

      {/* Available Tags */}
      {(isExpanded || searchQuery) && (
        <div className="mt-3 max-h-48 overflow-y-auto">
          {filteredTags.length > 0 ? (
            <div className="space-y-1">
              {filteredTags.map((tag) => {
                const taskCount = taskCounts[tag.id] || 0;
                return (
                  <button
                    key={tag.id}
                    onClick={() => onTagSelect(tag)}
                    className="w-full flex items-center justify-between p-2 text-left rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <TagChip tag={tag} size="sm" />
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                      {taskCount} task{taskCount !== 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-4">
              {searchQuery ? `No tags found for "${searchQuery}"` : 'No more tags available'}
            </div>
          )}
        </div>
      )}

      {/* Quick Filters */}
      {!isExpanded && !searchQuery && (
        <div className="mt-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            Quick filters:
          </div>
          <div className="flex flex-wrap gap-1">
            {availableTags.slice(0, 6).map((tag) => {
              const taskCount = taskCounts[tag.id] || 0;
              if (taskCount === 0) return null;
              
              return (
                <button
                  key={tag.id}
                  onClick={() => onTagSelect(tag)}
                  className="group"
                  title={`${taskCount} task${taskCount !== 1 ? 's' : ''}`}
                >
                  <TagChip tag={tag} size="sm" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing tag filters
export function useTagFilter(initialTags: Tag[] = []) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags);

  const selectTag = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const deselectTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tagId));
  };

  const clearAll = () => {
    setSelectedTags([]);
  };

  const toggleTag = (tag: Tag) => {
    if (selectedTags.find(t => t.id === tag.id)) {
      deselectTag(tag.id);
    } else {
      selectTag(tag);
    }
  };

  // Filter function for tasks
  const filterTasks = <T extends { tags?: string[] }>(tasks: T[]): T[] => {
    if (selectedTags.length === 0) return tasks;
    
    return tasks.filter(task => {
      if (!task.tags || task.tags.length === 0) return false;
      
      // Check if task has ALL selected tags (AND logic)
      return selectedTags.every(selectedTag => 
        task.tags!.includes(selectedTag.name)
      );
    });
  };

  // Alternative: OR logic filter (task has ANY of the selected tags)
  const filterTasksOr = <T extends { tags?: string[] }>(tasks: T[]): T[] => {
    if (selectedTags.length === 0) return tasks;
    
    return tasks.filter(task => {
      if (!task.tags || task.tags.length === 0) return false;
      
      // Check if task has ANY selected tag (OR logic)
      return selectedTags.some(selectedTag => 
        task.tags!.includes(selectedTag.name)
      );
    });
  };

  return {
    selectedTags,
    selectTag,
    deselectTag,
    clearAll,
    toggleTag,
    filterTasks,
    filterTasksOr,
    hasActiveFilters: selectedTags.length > 0
  };
} 