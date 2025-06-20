import { useState, useEffect } from "react";
import { boardsApi } from "../api/boards.api";
import type { Board } from "../types/api.types";

export function useBoards(userId: string | null) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = async () => {
    if (!userId) {
      setBoards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userBoards = await boardsApi.getUserBoards(userId);
      setBoards(userBoards || []);
    } catch (err) {
      console.error("Error fetching boards:", err);
      setError("Failed to load boards");
      setBoards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [userId]);

  return { boards, loading, error, refetch: fetchBoards };
}
