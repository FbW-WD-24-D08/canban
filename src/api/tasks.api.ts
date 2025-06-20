import type { CreateTaskData, Task, UpdateTaskData } from "@/types/api.types";
import { apiClient } from "./client";

export const tasksApi = {
  /**
   * Fetch tasks for a given column. When includeArchived is false (default)
   * we remove tasks that have `archived === true` on the client side so we
   * don\'t miss records that were created before the `archived` flag existed.
   */
  getColumnTasks: async (
    columnId: string,
    includeArchived = false
  ): Promise<Task[]> => {
    try {
      const all = await apiClient.get(
        `/tasks?columnId=${columnId}&_sort=position`
      );
      return includeArchived ? all : all.filter((t: Task) => !t.archived);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  },

  /**
   * Fetch all tasks for a given board by getting tasks from all columns
   */
  getBoardTasks: async (
    boardId: string,
    includeArchived = false
  ): Promise<Task[]> => {
    try {
      // First get all columns for this board
      const columns = await apiClient.get(`/columns?boardId=${boardId}`);

      // Then get all tasks for all columns
      const allTasks: Task[] = [];
      for (const column of columns) {
        const columnTasks = await apiClient.get(
          `/tasks?columnId=${column.id}&_sort=position`
        );
        allTasks.push(...columnTasks);
      }

      return includeArchived
        ? allTasks
        : allTasks.filter((t: Task) => !t.archived);
    } catch (error) {
      console.error("Error fetching board tasks:", error);
      throw error;
    }
  },

  createTask: async (data: CreateTaskData): Promise<Task> => {
    try {
      return await apiClient.post("/tasks", data);
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  updateTask: async (taskId: string, data: UpdateTaskData): Promise<Task> => {
    try {
      return await apiClient.patch(`/tasks/${taskId}`, data);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  updateTaskPositions: async (
    updates: { id: string; position: number; columnId?: string }[]
  ): Promise<void> => {
    try {
      const promises = updates.map(({ id, position, columnId }) => {
        const updateData: any = { position };
        if (columnId !== undefined) {
          updateData.columnId = columnId;
        }
        return apiClient.patch(`/tasks/${id}`, updateData);
      });
      await Promise.all(promises);
    } catch (error) {
      console.error("Error updating task positions:", error);
      throw error;
    }
  },
};
