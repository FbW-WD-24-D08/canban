import { apiClient } from "./client";

interface UserName {
  id: string;
  username: string;
}

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
};
