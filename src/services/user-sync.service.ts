/**
 * User Synchronization Service
 * 
 * Manages synchronization between Clerk authentication and JSON Server user data
 * Handles Clerk Organizations and ensures proper data sync
 * Ensures user profiles are kept in sync and available for the application
 */

import { useUser } from '@clerk/clerk-react';
import { apiClient } from '@/api/client';

export interface SyncedUser {
  id: string; // Clerk user ID
  clerkId: string; // Clerk user ID (same as id)
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  username?: string;
  lastSyncAt: string;
  createdAt: string;
  updatedAt: string;
  // Clerk Organization data
  organizationId?: string;
  organizationRole?: string; // 'org:admin' | 'org:member'
  organizationSlug?: string;
  // App-specific metadata
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    defaultBoardView?: 'board' | 'list';
  };
  isActive: boolean;
}

export interface SyncedOrganization {
  id: string; // Clerk org ID
  clerkOrgId: string;
  name: string;
  slug: string;
  imageUrl?: string;
  hasImage: boolean;
  membersCount: number;
  maxAllowedMemberships: number;
  adminDeleteEnabled: boolean;
  publicMetadata: Record<string, any>;
  privateMetadata: Record<string, any>;
  createdBy: string; // Clerk user ID
  createdAt: string;
  updatedAt: string;
  lastSyncAt: string;
  isActive: boolean;
}

export class UserSyncService {
  /**
   * Sync current Clerk user to JSON Server
   */
  static async syncCurrentUser(): Promise<SyncedUser | null> {
    try {
      const { user } = useUser();
      if (!user) return null;

      return await this.syncUser(user);
    } catch (error) {
      console.error('Error syncing current user:', error);
      return null;
    }
  }

  /**
   * Sync Clerk organization to JSON Server
   */
  static async syncOrganization(clerkOrg: any): Promise<SyncedOrganization> {
    try {
      const orgId = clerkOrg.id;
      const now = new Date().toISOString();

      // Check if organization already exists
      const existingOrgs: SyncedOrganization[] = await apiClient.get(`/organizations?clerkOrgId=${orgId}`);
      
      const orgData: Partial<SyncedOrganization> = {
        id: orgId,
        clerkOrgId: orgId,
        name: clerkOrg.name,
        slug: clerkOrg.slug,
        imageUrl: clerkOrg.imageUrl || clerkOrg.image_url,
        hasImage: clerkOrg.hasImage || clerkOrg.has_image || false,
        membersCount: clerkOrg.membersCount || clerkOrg.members_count || 0,
        maxAllowedMemberships: clerkOrg.maxAllowedMemberships || clerkOrg.max_allowed_memberships || 10,
        adminDeleteEnabled: clerkOrg.adminDeleteEnabled || clerkOrg.admin_delete_enabled || false,
        publicMetadata: clerkOrg.publicMetadata || clerkOrg.public_metadata || {},
        privateMetadata: clerkOrg.privateMetadata || clerkOrg.private_metadata || {},
        createdBy: clerkOrg.createdBy || clerkOrg.created_by,
        lastSyncAt: now,
        updatedAt: now,
        isActive: true,
      };

      if (existingOrgs.length > 0) {
        // Update existing organization
        const existingOrg = existingOrgs[0];
        const updatedOrg = {
          ...existingOrg,
          ...orgData,
        };

        console.log('UserSync: Updating existing organization:', orgId);
        return await apiClient.put(`/organizations/${existingOrg.id}`, updatedOrg);
      } else {
        // Create new organization
        const newOrg: SyncedOrganization = {
          ...orgData,
          createdAt: now,
        } as SyncedOrganization;

        console.log('UserSync: Creating new organization:', orgId);
        return await apiClient.post('/organizations', newOrg);
      }
    } catch (error) {
      console.error('Error syncing organization:', error);
      throw error;
    }
  }

  /**
   * Sync specific Clerk user to JSON Server with organization context
   */
  static async syncUser(clerkUser: any, clerkOrg?: any): Promise<SyncedUser> {
    try {
      const userId = clerkUser.id;
      const now = new Date().toISOString();

      // Check if user already exists in JSON Server
      const existingUsers: SyncedUser[] = await apiClient.get(`/users?clerkId=${userId}`);
      
      const userData: Partial<SyncedUser> = {
        id: userId,
        clerkId: userId,
        emailAddress: clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.emailAddress || '',
        firstName: clerkUser.firstName || clerkUser.first_name,
        lastName: clerkUser.lastName || clerkUser.last_name,
        fullName: clerkUser.fullName || `${clerkUser.firstName || clerkUser.first_name || ''} ${clerkUser.lastName || clerkUser.last_name || ''}`.trim(),
        imageUrl: clerkUser.imageUrl || clerkUser.image_url,
        username: clerkUser.username,
        // Organization context
        organizationId: clerkOrg?.id,
        organizationRole: clerkUser.organizationRole,
        organizationSlug: clerkOrg?.slug,
        lastSyncAt: now,
        updatedAt: now,
        isActive: true,
      };

      if (existingUsers.length > 0) {
        // Update existing user
        const existingUser = existingUsers[0];
        const updatedUser = {
          ...existingUser,
          ...userData,
          preferences: existingUser.preferences || {
            theme: 'dark',
            notifications: true,
            defaultBoardView: 'board',
          },
        };

        console.log('UserSync: Updating existing user:', userId);
        return await apiClient.put(`/users/${existingUser.id}`, updatedUser);
      } else {
        // Create new user
        const newUser: SyncedUser = {
          ...userData,
          createdAt: now,
          preferences: {
            theme: 'dark',
            notifications: true,
            defaultBoardView: 'board',
          },
        } as SyncedUser;

        console.log('UserSync: Creating new user:', userId);
        return await apiClient.post('/users', newUser);
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      throw error;
    }
  }

  /**
   * Get synced user from JSON Server
   */
  static async getSyncedUser(clerkId: string): Promise<SyncedUser | null> {
    try {
      const users: SyncedUser[] = await apiClient.get(`/users?clerkId=${clerkId}`);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error getting synced user:', error);
      return null;
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    clerkId: string, 
    preferences: Partial<SyncedUser['preferences']>
  ): Promise<SyncedUser | null> {
    try {
      const user = await this.getSyncedUser(clerkId);
      if (!user) return null;

      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          ...preferences,
        },
        updatedAt: new Date().toISOString(),
      };

      return await apiClient.put(`/users/${user.id}`, updatedUser);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return null;
    }
  }

  /**
   * Search synced users (for member adding)
   */
  static async searchUsers(query: string): Promise<SyncedUser[]> {
    try {
      const allUsers: SyncedUser[] = await apiClient.get('/users?isActive=true');
      
      const queryLower = query.toLowerCase();
      return allUsers.filter(user => {
        const email = user.emailAddress.toLowerCase();
        const firstName = user.firstName?.toLowerCase() || '';
        const lastName = user.lastName?.toLowerCase() || '';
        const fullName = user.fullName?.toLowerCase() || '';
        const username = user.username?.toLowerCase() || '';

        return email.includes(queryLower) || 
               firstName.includes(queryLower) || 
               lastName.includes(queryLower) ||
               fullName.includes(queryLower) ||
               username.includes(queryLower);
      }).slice(0, 10);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Mark user as inactive (soft delete)
   */
  static async deactivateUser(clerkId: string): Promise<void> {
    try {
      const user = await this.getSyncedUser(clerkId);
      if (!user) return;

      await apiClient.put(`/users/${user.id}`, {
        ...user,
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  }

  /**
   * Get all active users (for admin purposes)
   */
  static async getAllActiveUsers(): Promise<SyncedUser[]> {
    try {
      return await apiClient.get('/users?isActive=true');
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * Bulk sync multiple users (for admin/initial setup)
   */
  static async bulkSyncUsers(clerkUsers: any[]): Promise<SyncedUser[]> {
    try {
      const syncPromises = clerkUsers.map(user => this.syncUser(user));
      return await Promise.all(syncPromises);
    } catch (error) {
      console.error('Error bulk syncing users:', error);
      return [];
    }
  }
}

/**
 * React Hook for user synchronization
 */
export function useUserSync() {
  const { user: clerkUser, isLoaded } = useUser();

  const syncCurrentUser = async () => {
    if (!clerkUser || !isLoaded) return null;
    return await UserSyncService.syncUser(clerkUser);
  };

  const getSyncedUser = async () => {
    if (!clerkUser) return null;
    return await UserSyncService.getSyncedUser(clerkUser.id);
  };

  const updatePreferences = async (preferences: Partial<SyncedUser['preferences']>) => {
    if (!clerkUser) return null;
    return await UserSyncService.updateUserPreferences(clerkUser.id, preferences);
  };

  return {
    clerkUser,
    isLoaded,
    syncCurrentUser,
    getSyncedUser,
    updatePreferences,
  };
}