import type {
  Column,
  CreateColumnData,
  UpdateColumnData,
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
      // compute max position client side optional; json server can handle reorder later
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
