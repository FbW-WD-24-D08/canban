import {
  createContext,
  useContext,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useUser } from "@clerk/clerk-react";
import { usersApi } from "../../api/users.api";

interface User {
  id: string;
  name: string;
}

interface UserContextType {
  currentUser: User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const generateUsername = (clerkUser: any): string => {
    return (
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      clerkUser.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
      "Unknown User"
    );
  };

  const getUserEmail = (clerkUser: any): string => {
    return (
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      `${clerkUser.firstName || "user"}@example.com`
    );
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!clerkUser) {
        setCurrentUser(null);
        return;
      }

      try {
        let existingUser = await usersApi.getUserName(clerkUser.id);
        let existingEmail = await usersApi.getUserEmailById(clerkUser.id);

        if (!existingUser) {
          const username = generateUsername(clerkUser);
          existingUser = await usersApi.createUserName(clerkUser.id, username);
        }

        if (!existingEmail) {
          const email = getUserEmail(clerkUser);
          existingEmail = await usersApi.createUserEmail(clerkUser.id, email);
        }

        setCurrentUser({
          id: clerkUser.id,
          name: existingUser.username,
        });
      } catch (error) {
        console.error("Error loading user:", error);
        setCurrentUser({
          id: clerkUser.id,
          name: generateUsername(clerkUser),
        });
      }
    };

    loadUser();
  }, [clerkUser]);

  return (
    <UserContext.Provider value={{ currentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within UserProvider");
  }
  return context;
}
