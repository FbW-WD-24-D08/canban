import { tasksApi } from "@/api/tasks.api";
import type { Task } from "@/types/api.types";
import { useEffect, useState } from "react";

export function useTasks(columnId: string | null, includeArchived = false) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!columnId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const columnTasks = await tasksApi.getColumnTasks(
        columnId,
        includeArchived
      );
      setTasks(columnTasks);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [columnId, includeArchived]);

  return { tasks, loading, error, refetch: fetchTasks };
}
