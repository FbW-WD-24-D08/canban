import { useUser } from "@clerk/clerk-react";
import { createContext, useContext, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserContextType {
  currentUser: User | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();

  if (!isLoaded) {
    // Render a loading state while Clerk is initializing
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-zinc-400">
        Authenticating...
      </div>
    );
  }

  // Once loaded, we can derive the user object
  const currentUser: User | null = clerkUser
    ? {
        id: clerkUser.id,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ||
          "User",
        email: clerkUser.emailAddresses[0]?.emailAddress || "no-email",
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
  if (context === undefined) {
    throw new Error("useUserContext must be used within UserProvider");
  }
  return context;
}
