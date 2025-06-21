/**
 * Clerk Synchronization Hook
 * 
 * Automatically syncs Clerk users and organizations to JSON Server
 * Ensures data consistency and availability for the application
 */

import { useUser, useOrganization } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { UserSyncService, type SyncedUser, type SyncedOrganization } from '@/services/user-sync.service';

export function useClerkSync() {
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { organization: clerkOrganization, isLoaded: orgLoaded } = useOrganization();
  
  const [syncedUser, setSyncedUser] = useState<SyncedUser | null>(null);
  const [syncedOrganization, setSyncedOrganization] = useState<SyncedOrganization | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-enabled with proper safeguards
  useEffect(() => {
    if (!userLoaded || !clerkUser) return;

    // Prevent multiple syncs for the same user
    if (syncComplete && syncedUser?.clerkId === clerkUser.id) return;

    // Only sync once per user session
    const hasUserChanged = !syncedUser || syncedUser.clerkId !== clerkUser.id;
    if (!hasUserChanged && syncComplete) return;

    const performSync = async () => {
      try {
        setSyncing(true);
        setError(null);

        // Sync organization first if available  
        let syncedOrg: SyncedOrganization | null = null;
        if (clerkOrganization && orgLoaded) {
          syncedOrg = await UserSyncService.syncOrganization(clerkOrganization);
          setSyncedOrganization(syncedOrg);
        }

        // Sync current user
        const syncedUserData = await UserSyncService.syncUser(clerkUser, clerkOrganization);
        setSyncedUser(syncedUserData);

        setSyncComplete(true);
      } catch (err) {
        console.error('ClerkSync: Error during sync:', err);
        setError(err instanceof Error ? err.message : 'Unknown sync error');
        setSyncComplete(true); // Prevent infinite retries
      } finally {
        setSyncing(false);
      }
    };

    performSync();
  }, [clerkUser?.id, clerkOrganization?.id, userLoaded, orgLoaded]);

  // Manual sync function
  const forceSync = async () => {
    setSyncComplete(false);
    // This will trigger the useEffect above
  };

  // Get organization members (synced users in the same org)
  const getOrganizationMembers = async (): Promise<SyncedUser[]> => {
    if (!syncedOrganization) return [];
    
    try {
      const orgMembers = await UserSyncService.getAllActiveUsers();
      return orgMembers.filter(user => user.organizationId === syncedOrganization.id);
    } catch (error) {
      console.error('Error getting organization members:', error);
      return [];
    }
  };

  // Sync ALL organization members from Clerk to local database
  const syncAllOrganizationMembers = async (): Promise<void> => {
    try {
      // Only proceed if Clerk organization is properly loaded
      if (!clerkOrganization || !orgLoaded) {
        return;
      }

      // Get all organization members from Clerk API
      const memberships = await clerkOrganization.getMemberships();
      
      for (const membership of memberships.data) {
        const user = membership.publicUserData;
        if (user) {
          const userData = {
            id: user.userId,
            emailAddress: user.identifier || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            username: user.identifier?.split('@')[0] || '',
            imageUrl: user.imageUrl || '',
          };
          
          await UserSyncService.syncUser(userData, clerkOrganization);
        }
      }
    } catch (error) {
      console.error('ClerkSync: Error syncing organization members:', error);
      throw error; // Re-throw to show the actual error
    }
  };

  return {
    // Sync state
    syncing,
    syncComplete,
    error,
    
    // Synced data
    syncedUser,
    syncedOrganization,
    
    // Clerk data (original)
    clerkUser,
    clerkOrganization,
    
    // Loading states
    userLoaded,
    orgLoaded,
    isLoaded: userLoaded && orgLoaded,
    
    // Actions
    forceSync,
    getOrganizationMembers,
    syncAllOrganizationMembers,
    
    // Computed properties
    isOrganizationAdmin: syncedUser?.organizationRole === 'org:admin',
    isOrganizationMember: !!syncedUser?.organizationId,
    organizationName: syncedOrganization?.name || clerkOrganization?.name,
    organizationSlug: syncedOrganization?.slug || clerkOrganization?.slug,
  };
}

/**
 * Hook for checking if current user has access to a specific board
 */
export function useBoardAccess(boardId?: string) {
  const { syncedUser } = useClerkSync();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!boardId || !syncedUser) {
      setHasAccess(false);
      return;
    }

    const checkAccess = async () => {
      try {
        setChecking(true);
        
        // For now, assume user has access if they're synced
        // TODO: Implement proper board member checking with API
        setHasAccess(true);
      } catch (error) {
        console.error('Error checking board access:', error);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [boardId, syncedUser?.id]); // Only depend on stable IDs

  return {
    hasAccess,
    checking,
    userId: syncedUser?.id,
    isAdmin: syncedUser?.organizationRole === 'org:admin',
  };
}