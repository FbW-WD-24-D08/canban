import { useClerkSync } from "@/hooks/useClerkSync";
import type { SyncedUser } from "@/services/user-sync.service";
import type {
    OrganizationResource,
    UserResource,
} from "@clerk/types";
import {
    createContext,
    useContext,
    type ReactNode,
} from "react";

interface UserContextType {
  currentUser: SyncedUser | null;
  clerkUser: UserResource | null;
  syncedOrganization: OrganizationResource | null;
  isOrganizationAdmin: boolean;
  isOrganizationMember: boolean;
  syncing: boolean;
  syncComplete: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const {
    syncedUser,
    clerkUser,
    syncedOrganization,
    isOrganizationAdmin,
    isOrganizationMember,
    syncing,
    syncComplete,
  } = useClerkSync();

  return (
    <UserContext.Provider value={{
      currentUser: syncedUser,
      clerkUser,
      syncedOrganization,
      isOrganizationAdmin,
      isOrganizationMember,
      syncing,
      syncComplete,
    }}>
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
