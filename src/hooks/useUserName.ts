import { useState, useEffect } from "react";
import { usersApi } from "../api/users.api";

export function useUserName(userId: string) {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = async () => {
      if (!userId) {
        setUserName(null);
        setLoading(false);
        return;
      }

      try {
        const user = await usersApi.getUserName(userId);
        setUserName(user?.username || userId);
      } catch (error) {
        console.error("Error fetching username:", error);
        setUserName(userId);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, [userId]);

  return { userName, loading };
}
