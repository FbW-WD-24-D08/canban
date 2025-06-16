import { useState, useEffect } from "react";
import { boardsApi } from "../api/boards.api";
import { useUserName } from "./useUserName";
import type { BoardMember } from "../types/api.types";

export function useBoardMembers(boardId: string | null) {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!boardId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const boardMembers = await boardsApi.getBoardMembers(boardId);
      setMembers(boardMembers);
    } catch (err) {
      console.error("Error fetching board members:", err);
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [boardId]);

  return { members, loading, error, refetch: fetchMembers };
}

export function useMemberWithName(userId: string) {
  const { userName, loading } = useUserName(userId);
  return { name: userName, loading };
}
