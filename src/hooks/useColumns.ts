import { columnsApi } from "@/api/columns.api";
import type { Column } from "@/types/api.types";
import { useEffect, useState } from "react";

export function useColumns(boardId: string | null) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColumns = async () => {
    if (!boardId) {
      setColumns([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const boardColumns = await columnsApi.getBoardColumns(boardId);
      setColumns(boardColumns);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load columns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [boardId]);

  return { columns, loading, error, refetch: fetchColumns };
}
