import { apiClient } from "./client";
import type { UserName, UserEmail } from "../types/api.types.ts";

export const usersApi = {
  getUserName: async (id: string): Promise<UserName | null> => {
    try {
      const usernames: UserName[] = await apiClient.get("/usernames");
      return usernames.find((user) => user.id === id) || null;
    } catch (error) {
      console.error("Error fetching username:", error);
      return null;
    }
  },

  createUserName: async (id: string, username: string): Promise<UserName> => {
    const newUser: UserName = { id, username };
    return await apiClient.post("/usernames", newUser);
  },

  getUserEmailById: async (id: string): Promise<UserEmail | null> => {
    try {
      const useremails: UserEmail[] = await apiClient.get("/useremails");
      return useremails.find((email) => email.id === id) || null;
    } catch (error) {
      console.error("Error fetching user email:", error);
      return null;
    }
  },

  createUserEmail: async (id: string, email: string): Promise<UserEmail> => {
    const newEmail: UserEmail = { id, email };
    return await apiClient.post("/useremails", newEmail);
  },
};
