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

  getUserName: async (
    id: string
  ): Promise<{ id: string; username: string } | null> => {
    try {
      return apiClient.get<{ id: string; username: string }>(
        `/users/${id}/name`
      );
    } catch {
      return null;
    }
  },

  getUserEmailById: async (
    id: string
  ): Promise<{ id: string; email: string } | null> => {
    try {
      return apiClient.get<{ id: string; email: string }>(`/users/${id}/email`);
    } catch {
      return null;
    }
  },

  createUserName: async (
    id: string,
    username: string
  ): Promise<{ id: string; username: string }> => {
    return apiClient.post<{ id: string; username: string }>("/users/name", {
      id,
      username,
    });
  },

  createUserEmail: async (
    id: string,
    email: string
  ): Promise<{ id: string; email: string }> => {
    return apiClient.post<{ id: string; email: string }>("/users/email", {
      id,
      email,
    });
  },

  getUserIdByEmail: async (
    email: string
  ): Promise<{ id: string; email: string } | null> => {
    try {
      return apiClient.get<{ id: string; email: string }>(
        `/users/email/${encodeURIComponent(email)}`
      );
    } catch {
      return null;
    }
  },
};

export default usersApi;
