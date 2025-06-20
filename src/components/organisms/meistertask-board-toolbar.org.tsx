import type { Tag, Task } from "@/types/api.types";
import { Filter, LayoutGrid, List } from "lucide-react";
import React, { useState } from "react";
import { TagFilter, useTagFilter } from "../molecules/tag-filter.comp";

interface MeisterTaskBoardToolbarProps {
  tasks: Task[];
  onFilteredTasksChange: (filteredTasks: Task[]) => void;
  className?: string;
}

export function MeisterTaskBoardToolbar({
  tasks,
  onFilteredTasksChange,
  className = ""
}: MeisterTaskBoardToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Toolbar initialized with tasks

  // Extract all unique tags from tasks
  const getTagColor = (tagName: string): string => {
    const colorMap: Record<string, string> = {
      'Frontend': 'blue',
      'Backend': 'green', 
      'Design': 'purple',
      'UI/UX': 'pink',
      'Security': 'red',
      'API': 'orange',
      'Testing': 'yellow',
      'Mobile': 'teal',
      'UX': 'pink',
      'Performance': 'green',
      'Database': 'gray',
      'Onboarding': 'blue',
      'Components': 'blue',
      'Authentication': 'red',
      'QA': 'yellow',
      'Optimization': 'green',
      'Tutorial': 'purple',
      'DevOps': 'orange',
      'CI/CD': 'orange',
      'Automation': 'orange',
      'Infrastructure': 'gray'
    };
    return colorMap[tagName] || 'gray';
  };

  // Extract all unique tags from all tasks
  const allTagNames = Array.from(
    new Set(
      tasks
        .filter(task => task.tags && task.tags.length > 0)
        .flatMap(task => task.tags || [])
    )
  );

  // Fallback demo tags if no tasks are found
  const fallbackTags = tasks.length === 0 ? [
    'Frontend', 'Backend', 'Design', 'UI/UX', 'Testing', 'Mobile'
  ] : [];

  const finalTagNames = allTagNames.length > 0 ? allTagNames : fallbackTags;

  const allTags: Tag[] = finalTagNames.map(tagName => ({
    id: tagName,
    name: tagName,
    color: getTagColor(tagName),
    boardId: '14e1'
  }));

  // Tags extracted and processed

  // Calculate task counts per tag
  const taskCounts: Record<string, number> = {};
  allTags.forEach(tag => {
    const count = tasks.filter(task => 
      task.tags?.includes(tag.name)
    ).length;
    // For fallback tags, give them demo counts
    const finalCount = tasks.length === 0 && fallbackTags.includes(tag.name) 
      ? Math.floor(Math.random() * 3) + 1 
      : count;
    taskCounts[tag.id] = finalCount;
  });

  // Tag filter hook
  const {
    selectedTags,
    selectTag,
    deselectTag,
    clearAll,
    filterTasksOr,
    hasActiveFilters
  } = useTagFilter();

  // Apply filters whenever selection changes
  React.useEffect(() => {
    const filteredTasks = filterTasksOr(tasks);
    onFilteredTasksChange(filteredTasks);
  }, [selectedTags, tasks, filterTasksOr, onFilteredTasksChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Toolbar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-zinc-900/50 to-zinc-800/50 backdrop-blur border border-zinc-700 rounded-lg p-4">
        {/* Left Side - Filters */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-teal-600 text-white shadow-lg' 
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {selectedTags.length}
              </span>
            )}
          </button>

          {/* Active Filter Summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>Showing tasks with:</span>
              <div className="flex gap-1">
                {selectedTags.slice(0, 2).map(tag => (
                  <span 
                    key={tag.id}
                    className="px-2 py-0.5 bg-zinc-700 text-zinc-300 rounded text-xs"
                  >
                    {tag.name}
                  </span>
                ))}
                {selectedTags.length > 2 && (
                  <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 rounded text-xs">
                    +{selectedTags.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - View Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-700 rounded-md p-1 flex">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded text-xs transition-all ${
                viewMode === 'board' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Board view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-all ${
                viewMode === 'list' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="animate-slideDown">
          <TagFilter
            availableTags={allTags}
            selectedTags={selectedTags}
            onTagSelect={selectTag}
            onTagDeselect={deselectTag}
            onClearAll={clearAll}
            taskCounts={taskCounts}
          />
        </div>
      )}

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-teal-300">
              Showing {filterTasksOr(tasks).length} of {tasks.length} tasks
            </span>
            <button
              onClick={clearAll}
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


