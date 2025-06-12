import { useState, useEffect } from "react";
import { boardsApi } from "../api/boards.api";
import type { Board } from "../types/api.types";

export function useBoard(boardId: string | null, userId: string | null) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const fetchBoard = async () => {
    if (!boardId || !userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const accessGranted = await boardsApi.checkAccess(
        Number(boardId),
        userId
      );
      setHasAccess(accessGranted);

      if (!accessGranted) {
        setError("Access denied - you are not a member of this board");
        setLoading(false);
        return;
      }

      const boardData = await boardsApi.getBoardById(Number(boardId));
      setBoard(boardData);
    } catch (err) {
      console.error("Error fetching board:", err);
      setError("Failed to load board");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBoard();
  }, [boardId, userId]);

  return { board, loading, error, hasAccess, refetch: fetchBoard };
}
