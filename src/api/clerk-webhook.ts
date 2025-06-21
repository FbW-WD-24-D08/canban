/**
 * Clerk Webhook Handler
 * 
 * Processes Clerk webhook events and syncs user data to JSON Server database.
 * Handles user.created, user.updated, and user.deleted events securely.
 */

import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/backend';

// Database integration utilities
const DB_BASE_URL = 'http://localhost:3001';

interface ClerkUser {
  id: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
  }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  username: string | null;
  created_at: number;
  updated_at: number;
}

interface LocalUser {
  id: string;
  clerkId: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  fullName: string;
  imageUrl: string;
  username: string;
  lastSyncAt: string;
  createdAt: string;
  updatedAt: string;
  preferences: {
    theme: string;
    notifications: boolean;
    defaultBoardView: string;
  };
  isActive: boolean;
  organizationId?: string;
  organizationSlug?: string;
}

/**
 * Verify webhook signature using Clerk's webhook secret
 */
export function verifyWebhookSignature(
  payload: string,
  headers: Record<string, string>
): WebhookEvent {
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  
  if (!webhookSecret) {
    throw new Error('CLERK_WEBHOOK_SIGNING_SECRET is not configured');
  }

  try {
    const wh = new Webhook(webhookSecret);
    return wh.verify(payload, headers) as WebhookEvent;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Fetch current users from JSON Server
 */
async function getCurrentUsers(): Promise<LocalUser[]> {
  try {
    const response = await fetch(`${DB_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching current users:', error);
    return [];
  }
}

/**
 * Transform Clerk user data to local database format
 */
function transformClerkUserToLocal(clerkUser: ClerkUser): Omit<LocalUser, 'id'> {
  const primaryEmail = clerkUser.email_addresses[0]?.email_address || '';
  const firstName = clerkUser.first_name || '';
  const lastName = clerkUser.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || primaryEmail.split('@')[0];
  
  return {
    clerkId: clerkUser.id,
    emailAddress: primaryEmail,
    firstName,
    lastName,
    fullName,
    imageUrl: clerkUser.image_url || '',
    username: clerkUser.username || primaryEmail.split('@')[0],
    lastSyncAt: new Date().toISOString(),
    createdAt: new Date(clerkUser.created_at).toISOString(),
    updatedAt: new Date(clerkUser.updated_at).toISOString(),
    preferences: {
      theme: 'dark',
      notifications: true,
      defaultBoardView: 'board'
    },
    isActive: true
  };
}

/**
 * Create new user in JSON Server
 */
async function createUser(userData: Omit<LocalUser, 'id'>): Promise<boolean> {
  try {
    const response = await fetch(`${DB_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: userData.clerkId, // Use Clerk ID as primary key
        ...userData
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    console.log('✅ User created successfully:', userData.clerkId);
    return true;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return false;
  }
}

/**
 * Update existing user in JSON Server
 */
async function updateUser(clerkId: string, userData: Partial<LocalUser>): Promise<boolean> {
  try {
    // Find user by clerkId
    const users = await getCurrentUsers();
    const existingUser = users.find(user => user.clerkId === clerkId);
    
    if (!existingUser) {
      console.log('User not found for update, creating new user:', clerkId);
      return false;
    }

    const response = await fetch(`${DB_BASE_URL}/users/${existingUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        lastSyncAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    console.log('✅ User updated successfully:', clerkId);
    return true;
  } catch (error) {
    console.error('❌ Error updating user:', error);
    return false;
  }
}

/**
 * Soft delete user (mark as inactive)
 */
async function deleteUser(clerkId: string): Promise<boolean> {
  try {
    const users = await getCurrentUsers();
    const existingUser = users.find(user => user.clerkId === clerkId);
    
    if (!existingUser) {
      console.log('User not found for deletion:', clerkId);
      return true; // Already gone
    }

    const response = await fetch(`${DB_BASE_URL}/users/${existingUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isActive: false,
        lastSyncAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }

    console.log('✅ User soft deleted successfully:', clerkId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return false;
  }
}

/**
 * Handle user.created event
 */
async function handleUserCreated(userData: ClerkUser): Promise<boolean> {
  console.log('🔄 Processing user.created event:', userData.id);
  
  const localUserData = transformClerkUserToLocal(userData);
  return await createUser(localUserData);
}

/**
 * Handle user.updated event
 */
async function handleUserUpdated(userData: ClerkUser): Promise<boolean> {
  console.log('🔄 Processing user.updated event:', userData.id);
  
  const localUserData = transformClerkUserToLocal(userData);
  const success = await updateUser(userData.id, localUserData);
  
  // If update failed, try creating the user
  if (!success) {
    console.log('Update failed, attempting to create user:', userData.id);
    return await createUser(localUserData);
  }
  
  return success;
}

/**
 * Handle user.deleted event
 */
async function handleUserDeleted(clerkId: string): Promise<boolean> {
  console.log('🔄 Processing user.deleted event:', clerkId);
  
  return await deleteUser(clerkId);
}

/**
 * Main webhook handler function
 */
export async function handleClerkWebhook(
  payload: string,
  headers: Record<string, string>
): Promise<{ success: boolean; message: string; statusCode: number }> {
  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(payload, headers);
    
    console.log('🎯 Received Clerk webhook event:', event.type);
    
    let success = false;
    let message = '';

    // Handle different event types
    switch (event.type) {
      case 'user.created':
        success = await handleUserCreated(event.data as ClerkUser);
        message = success ? 'User created successfully' : 'Failed to create user';
        break;
        
      case 'user.updated':
        success = await handleUserUpdated(event.data as ClerkUser);
        message = success ? 'User updated successfully' : 'Failed to update user';
        break;
        
      case 'user.deleted':
        success = await handleUserDeleted((event.data as { id: string }).id);
        message = success ? 'User deleted successfully' : 'Failed to delete user';
        break;
        
      default:
        console.log('🤷 Unhandled webhook event type:', event.type);
        return {
          success: true,
          message: `Event type ${event.type} not handled`,
          statusCode: 200
        };
    }

    return {
      success,
      message,
      statusCode: success ? 200 : 500
    };
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      statusCode: error instanceof Error && error.message.includes('signature') ? 401 : 500
    };
  }
}