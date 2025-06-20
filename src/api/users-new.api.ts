import { apiClient } from "./client";
import type { User, CreateUserData, UpdateUserData } from "../types/api.types";

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    return apiClient.get<User[]>("/users");
  },

  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    return apiClient.post<User>("/users", data);
  },

  updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

export default usersApi;
