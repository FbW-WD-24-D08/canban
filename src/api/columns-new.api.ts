import { apiClient } from "./client";
import type {
  Column,
  CreateColumnData,
  UpdateColumnData,
} from "../types/api.types";

export const columnsApi = {
  getColumns: async (boardId?: string): Promise<Column[]> => {
    const params = boardId ? `?boardId=${boardId}` : "";
    return apiClient.get<Column[]>(`/columns${params}`);
  },

  getColumnById: async (id: string): Promise<Column> => {
    return apiClient.get<Column>(`/columns/${id}`);
  },

  createColumn: async (data: CreateColumnData): Promise<Column> => {
    return apiClient.post<Column>("/columns", data);
  },

  updateColumn: async (id: string, data: UpdateColumnData): Promise<Column> => {
    return apiClient.put<Column>(`/columns/${id}`, data);
  },

  deleteColumn: async (id: string): Promise<void> => {
    await apiClient.delete(`/columns/${id}`);
  },
};

export default columnsApi;
