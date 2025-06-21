import { useState, useEffect } from "react";
import { UserSyncService } from "../services/user-sync.service";

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
        // First try to get from the synced users
        const user = await UserSyncService.getSyncedUser(userId);
        if (user) {
          // Priority: 1. username → 2. fullName → 3. firstName + lastName → 4. emailAddress → 5. id → 6. clerkId
          const displayName = user.username || 
                             user.fullName || 
                             (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                             user.emailAddress || 
                             user.id ||
                             user.clerkId;
          setUserName(displayName);
        } else {
          // Fallback: try to get all users and find by ID
          const allUsers = await UserSyncService.getAllActiveUsers();
          const foundUser = allUsers.find(u => u.id === userId || u.clerkId === userId);
          
          if (foundUser) {
            const displayName = foundUser.username || 
                               foundUser.fullName || 
                               (foundUser.firstName && foundUser.lastName ? `${foundUser.firstName} ${foundUser.lastName}` : null) ||
                               foundUser.emailAddress || 
                               foundUser.id ||
                               foundUser.clerkId;
            setUserName(displayName);
          } else {
            setUserName(userId);
          }
        }
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
