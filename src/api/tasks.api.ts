import { apiClient } from "./client";
import type { Task, CreateTaskData, UpdateTaskData } from "@/types/api.types";

export const tasksApi = {
  getBoardTasks: async (boardId: number): Promise<Task[]> => {
    try {
      const columns = await apiClient.get(`/columns?boardId=${boardId}`);

      if (columns.length === 0) {
        return [];
      }

      const columnIds = columns.map((c: any) => c.id);
      const tasksPromises = columnIds.map((id: number) =>
        apiClient.get(`/tasks?columnId=${id}&_sort=position`)
      );

      const tasksArrays = await Promise.all(tasksPromises);
      return tasksArrays.flat();
    } catch (error) {
      console.error(`Error fetching tasks for board ${boardId}:`, error);
      throw error;
    }
  },

  createTask: async (data: CreateTaskData): Promise<Task> => {
    try {
      const existingTasks = await apiClient.get(
        `/tasks?columnId=${data.columnId}`
      );
      const maxPosition =
        existingTasks.length > 0
          ? Math.max(...existingTasks.map((t: Task) => t.position))
          : -1;

      return await apiClient.post("/tasks", {
        ...data,
        position: maxPosition + 1,
      });
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  updateTask: async (taskId: number, data: UpdateTaskData): Promise<Task> => {
    try {
      return await apiClient.put(`/tasks/${taskId}`, data);
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },

  deleteTask: async (taskId: number): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  },

  updateTaskPositions: async (
    updates: { id: number; position: number; columnId?: number }[]
  ): Promise<void> => {
    try {
      const promises = updates.map(({ id, position, columnId }) => {
        const updateData: any = { position };
        if (columnId !== undefined) {
          updateData.columnId = columnId;
        }
        return apiClient.put(`/tasks/${id}`, updateData);
      });
      await Promise.all(promises);
    } catch (error) {
      console.error("Error updating task positions:", error);
      throw error;
    }
  },
};
