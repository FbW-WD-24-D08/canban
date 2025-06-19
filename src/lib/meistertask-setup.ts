import { columnsApi } from "@/api/columns.api";
import type { Column } from "@/types/api.types";

// MeisterTask standard column configuration
export const MEISTERTASK_COLUMNS = [
  {
    title: "Backlog",
    icon: "📋",
    color: "#9E9E9E",
    position: 0,
    description: "Ideas and tasks waiting to be prioritized",
  },
  {
    title: "To Do",
    icon: "📝",
    color: "#2196F3",
    position: 1,
    description: "Ready to start working on",
  },
  {
    title: "Doing",
    icon: "⚡",
    color: "#FF9800",
    position: 2,
    description: "Currently in progress",
  },
  {
    title: "Review",
    icon: "👁️",
    color: "#9C27B0",
    position: 3,
    description: "Completed work awaiting review",
  },
  {
    title: "Done",
    icon: "✅",
    color: "#4CAF50",
    position: 4,
    description: "Completed and approved tasks",
  },
];

/**
 * Check if a board should use MeisterTask features
 */
export function isMeisterTaskBoard(
  boardId: string,
  boardDescription?: string
): boolean {
  return boardId === "14e1" || boardDescription?.includes("MT clone") || false;
}

/**
 * Set up MeisterTask columns for a board if they don't exist
 */
export async function setupMeisterTaskColumns(
  boardId: string
): Promise<Column[]> {
  try {
    // Check if columns already exist
    const existingColumns = await columnsApi.getBoardColumns(boardId);

    // If columns exist, return them (don't overwrite)
    if (existingColumns.length > 0) {
      return existingColumns;
    }

    // Create MeisterTask columns
    const createdColumns: Column[] = [];

    for (const columnConfig of MEISTERTASK_COLUMNS) {
      const column = await columnsApi.createColumn({
        title: columnConfig.title,
        boardId,
        position: columnConfig.position,
        color: columnConfig.color,
        icon: columnConfig.icon,
      });
      createdColumns.push(column);
    }

    return createdColumns;
  } catch (error) {
    console.error("Failed to setup MeisterTask columns:", error);
    throw error;
  }
}

/**
 * Get MeisterTask color for a column by title
 */
export function getMeisterTaskColumnColor(columnTitle: string): string {
  const column = MEISTERTASK_COLUMNS.find(
    (col) => col.title.toLowerCase() === columnTitle.toLowerCase()
  );
  return column?.color || "#9E9E9E";
}

/**
 * Get MeisterTask icon for a column by title
 */
export function getMeisterTaskColumnIcon(columnTitle: string): string {
  const column = MEISTERTASK_COLUMNS.find(
    (col) => col.title.toLowerCase() === columnTitle.toLowerCase()
  );
  return column?.icon || "📋";
}
