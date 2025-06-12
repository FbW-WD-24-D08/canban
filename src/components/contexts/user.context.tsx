import { createContext, useContext, type ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";

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
  const currentUser: User | null = clerkUser
    ? {
        id: clerkUser.id,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          clerkUser.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
          "Unknown User",
      }
    : null;

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
