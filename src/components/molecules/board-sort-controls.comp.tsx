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
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-400">Sort by:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSortByTitle}
        className={`flex items-center gap-2 ${
          sortBy === "title" ? "bg-zinc-700 text-white" : ""
        }`}
      >
        <Type className="w-4 h-4" />
        Title
        {sortBy === "title" && (
          <ArrowUpDown
            className={`w-3 h-3 ${sortOrder === "desc" ? "rotate-180" : ""}`}
          />
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSortByDate}
        className={`flex items-center gap-2 ${
          sortBy === "date" ? "bg-zinc-700 text-white" : ""
        }`}
      >
        <Calendar className="w-4 h-4" />
        Date
        {sortBy === "date" && (
          <ArrowUpDown
            className={`w-3 h-3 ${sortOrder === "desc" ? "rotate-180" : ""}`}
          />
        )}
      </Button>
    </div>
  );
}
