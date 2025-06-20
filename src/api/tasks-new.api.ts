import { apiClient } from "./client";
import type { Task, CreateTaskData, UpdateTaskData } from "../types/api.types";

export const tasksApi = {
  getTasks: async (columnId?: string, boardId?: string): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (columnId) params.append("columnId", columnId);
    if (boardId) params.append("boardId", boardId);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<Task[]>(`/tasks${queryString}`);
  },

  getTaskById: async (id: string): Promise<Task> => {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  createTask: async (data: CreateTaskData): Promise<Task> => {
    return apiClient.post<Task>("/tasks", data);
  },

  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    return apiClient.put<Task>(`/tasks/${id}`, data);
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

export default tasksApi;
