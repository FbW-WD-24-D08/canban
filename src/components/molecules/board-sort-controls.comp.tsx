import { ArrowUpDown, Calendar, Type } from "lucide-react";
import { Button } from "../atoms/button.comp";

type SortBy = "title" | "date";
type SortOrder = "asc" | "desc";

interface BoardSortControlsProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
}

export function BoardSortControls({
  sortBy,
  sortOrder,
  onSortChange,
}: BoardSortControlsProps) {
  const handleSortByTitle = () => {
    const newOrder = sortBy === "title" && sortOrder === "asc" ? "desc" : "asc";
    onSortChange("title", newOrder);
  };

  const handleSortByDate = () => {
    const newOrder = sortBy === "date" && sortOrder === "asc" ? "desc" : "asc";
    onSortChange("date", newOrder);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs sm:text-sm text-zinc-400 whitespace-nowrap">Sort by:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSortByTitle}
        className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 ${
          sortBy === "title" ? "bg-zinc-700 text-white" : ""
        }`}
      >
        <Type className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Title</span>
        <span className="sm:hidden">T</span>
        {sortBy === "title" && (
          <ArrowUpDown
            className={`w-2 h-2 sm:w-3 sm:h-3 ${sortOrder === "desc" ? "rotate-180" : ""}`}
          />
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSortByDate}
        className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 ${
          sortBy === "date" ? "bg-zinc-700 text-white" : ""
        }`}
      >
        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Date</span>
        <span className="sm:hidden">D</span>
        {sortBy === "date" && (
          <ArrowUpDown
            className={`w-2 h-2 sm:w-3 sm:h-3 ${sortOrder === "desc" ? "rotate-180" : ""}`}
          />
        )}
      </Button>
    </div>
  );
}
