import type { Tag } from "@/types/api.types";
import { Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TagChip } from "../atoms/tag-chip.comp";

interface TagSelectorProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onTagSelect: (tag: Tag) => void;
  onTagDeselect: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => Promise<Tag>;
  maxTags?: number;
  placeholder?: string;
  className?: string;
}

const TAG_COLOR_OPTIONS = [
  { name: "Red", value: "red", bg: "bg-red-500" },
  { name: "Orange", value: "orange", bg: "bg-orange-500" },
  { name: "Yellow", value: "yellow", bg: "bg-yellow-500" },
  { name: "Green", value: "green", bg: "bg-green-500" },
  { name: "Blue", value: "blue", bg: "bg-blue-500" },
  { name: "Purple", value: "purple", bg: "bg-purple-500" },
  { name: "Pink", value: "pink", bg: "bg-pink-500" },
  { name: "Teal", value: "teal", bg: "bg-teal-500" },
  { name: "Gray", value: "gray", bg: "bg-zinc-500" },
];

export function TagSelector({
  selectedTags,
  availableTags,
  onTagSelect,
  onTagDeselect,
  onCreateTag,
  maxTags = 6,
  placeholder = "Search or create tags...",
  className = ""
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("blue");
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Filter available tags based on search and exclude already selected
  const selectedTagIds = new Set(selectedTags.map(t => t.id));
  const filteredTags = availableTags.filter(tag => 
    !selectedTagIds.has(tag.id) &&
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Check if we can create a new tag with the search query
  const canCreateNewTag = searchQuery.trim() && 
    !availableTags.some(tag => tag.name.toLowerCase() === searchQuery.toLowerCase()) &&
    selectedTags.length < maxTags;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setSearchQuery("");
        setNewTagName("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleTagSelect = (tag: Tag) => {
    if (selectedTags.length < maxTags) {
      onTagSelect(tag);
      setSearchQuery("");
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || selectedTags.length >= maxTags) return;
    
    setIsCreating(true);
    try {
      const newTag = await onCreateTag(newTagName.trim(), newTagColor);
      onTagSelect(newTag);
      setNewTagName("");
      setSearchQuery("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
      setIsCreating(false);
    }
  };

  const handleQuickCreate = async () => {
    if (!canCreateNewTag) return;
    
    setIsCreating(true);
    try {
      const newTag = await onCreateTag(searchQuery.trim(), "blue");
      onTagSelect(newTag);
      setSearchQuery("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
      setIsCreating(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
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
      )}

      {/* Search Input */}
      <div className="relative">
        <div 
          className={`
            flex items-center gap-2 px-3 py-2 border rounded-lg cursor-text
            bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600
            focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500
            ${isOpen ? 'border-teal-500 ring-1 ring-teal-500' : ''}
          `}
          onClick={() => setIsOpen(true)}
        >
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedTags.length >= maxTags ? `Max ${maxTags} tags` : placeholder}
            disabled={selectedTags.length >= maxTags}
            className="flex-1 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
          />
          {selectedTags.length < maxTags && (
            <span className="text-xs text-zinc-400">
              {selectedTags.length}/{maxTags}
            </span>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              {/* Existing Tags */}
              {filteredTags.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                    Select existing tag
                  </div>
                  <div className="space-y-1">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleTagSelect(tag)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <TagChip tag={tag} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Create */}
              {canCreateNewTag && (
                <div className="border-t border-zinc-200 dark:border-zinc-700 p-2">
                  <button
                    onClick={handleQuickCreate}
                    disabled={isCreating}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-md hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-teal-700 dark:text-teal-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Create "{searchQuery.trim()}"</span>
                  </button>
                </div>
              )}

              {/* Advanced Create */}
              <div className="border-t border-zinc-200 dark:border-zinc-700 p-2">
                <button
                  onClick={() => setIsCreating(!isCreating)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-700 dark:text-zinc-300"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Create new tag</span>
                </button>

                {isCreating && (
                  <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Tag name
                        </label>
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="Enter tag name"
                          className="w-full px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCreateTag();
                            }
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Color
                        </label>
                        <div className="flex gap-1">
                          {TAG_COLOR_OPTIONS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setNewTagColor(color.value)}
                              className={`
                                w-6 h-6 rounded-full border-2 transition-all
                                ${color.bg}
                                ${newTagColor === color.value 
                                  ? 'border-zinc-900 dark:border-zinc-100 scale-110' 
                                  : 'border-zinc-300 dark:border-zinc-600 hover:scale-105'
                                }
                              `}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateTag}
                          disabled={!newTagName.trim() || isCreating}
                          className="flex-1 px-3 py-1 text-xs bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-400 text-white rounded transition-colors"
                        >
                          {isCreating ? 'Creating...' : 'Create'}
                        </button>
                        <button
                          onClick={() => {
                            setIsCreating(false);
                            setNewTagName("");
                          }}
                          className="px-3 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* No Results */}
            {filteredTags.length === 0 && !canCreateNewTag && searchQuery && (
              <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No tags found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 