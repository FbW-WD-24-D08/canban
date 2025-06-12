import { apiClient } from "./client";
import type {
  Column,
  CreateColumnData,
  UpdateColumnData,
} from "@/types/api.types";

export const columnsApi = {
  getBoardColumns: async (boardId: number): Promise<Column[]> => {
    try {
      return await apiClient.get(`/columns?boardId=${boardId}&_sort=position`);
    } catch (error) {
      console.error(`Error fetching columns for board ${boardId}:`, error);
      throw error;
    }
  },

  createColumn: async (data: CreateColumnData): Promise<Column> => {
    try {
      const existingColumns = await apiClient.get(
        `/columns?boardId=${data.boardId}`
      );
      const maxPosition =
        existingColumns.length > 0
          ? Math.max(...existingColumns.map((c: Column) => c.position))
          : -1;

      return await apiClient.post("/columns", {
        ...data,
        position: maxPosition + 1,
      });
    } catch (error) {
      console.error("Error creating column:", error);
      throw error;
    }
  },

  updateColumn: async (
    columnId: number,
    data: UpdateColumnData
  ): Promise<Column> => {
    try {
      return await apiClient.put(`/columns/${columnId}`, data);
    } catch (error) {
      console.error(`Error updating column ${columnId}:`, error);
      throw error;
    }
  },

  deleteColumn: async (columnId: number): Promise<void> => {
    try {
      await apiClient.delete(`/columns/${columnId}`);
    } catch (error) {
      console.error(`Error deleting column ${columnId}:`, error);
      throw error;
    }
  },

  updateColumnPositions: async (
    updates: { id: number; position: number }[]
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
