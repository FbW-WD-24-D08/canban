import type {
  Column,
  CreateColumnData,
  UpdateColumnData,
  Task,
} from "@/types/api.types";
import { apiClient } from "./client";

export const columnsApi = {
  getBoardColumns: async (boardId: string): Promise<Column[]> => {
    try {
      return await apiClient.get(`/columns?boardId=${boardId}&_sort=position`);
    } catch (error) {
      console.error("Error fetching columns:", error);
      throw error;
    }
  },

  createColumn: async (data: CreateColumnData): Promise<Column> => {
    try {
      return await apiClient.post("/columns", data);
    } catch (error) {
      console.error("Error creating column:", error);
      throw error;
    }
  },
  updateColumn: async (
    columnId: string,
    data: UpdateColumnData
  ): Promise<Column> => {
    try {
      return await apiClient.put(`/columns/${columnId}`, data);
    } catch (error) {
      console.error("Error updating column:", error);
      throw error;
    }
  },

  deleteColumn: async (columnId: string): Promise<void> => {
    try {
      const tasks: Task[] = await apiClient.get(`/tasks?columnId=${columnId}`);

      const deleteTaskPromises = tasks.map((task) =>
        apiClient.delete(`/tasks/${task.id}`)
      );

      await Promise.all(deleteTaskPromises);
      await apiClient.delete(`/columns/${columnId}`);
    } catch (error) {
      console.error("Error deleting column:", error);
      throw error;
    }
  },

  updateColumnPositions: async (
    updates: { id: string; position: number }[]
  ): Promise<void> => {
    try {
      const promises = updates.map(({ id, position }) =>
        apiClient.put(`/columns/${id}`, { position })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error updating column positions:", error);
      throw error;
    }
  },
};
