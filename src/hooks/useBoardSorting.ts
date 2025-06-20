import { useState, useMemo } from "react";
import type { Board } from "../types/api.types";

type SortBy = "title" | "date";
type SortOrder = "asc" | "desc";

export function useBoardSorting(boards: Board[] = []) {
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedBoards = useMemo(() => {
    if (!boards || !Array.isArray(boards)) {
      return [];
    }

    return [...boards].sort((a, b) => {
      if (sortBy === "title") {
        const comparison = a.title.localeCompare(b.title);
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        const comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        return sortOrder === "asc" ? comparison : -comparison;
      }
    });
  }, [boards, sortBy, sortOrder]);

  const handleSortChange = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return {
    sortBy,
    sortOrder,
    sortedBoards,
    handleSortChange,
  };
}
