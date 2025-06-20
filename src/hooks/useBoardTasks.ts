import { tasksApi } from "@/api/tasks.api";
import type { Task } from "@/types/api.types";
import { useEffect, useState } from "react";

export function useBoardTasks(boardId: string | null, includeArchived = false) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!boardId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const boardTasks = await tasksApi.getBoardTasks(boardId, includeArchived);
      setTasks(boardTasks);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load board tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [boardId, includeArchived]);

  return { tasks, loading, error, refetch: fetchTasks };
}
