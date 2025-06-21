/**
 * Clerk Webhook Server
 * 
 * Standalone Express server to handle Clerk webhooks alongside JSON Server.
 * This server runs on port 3002 and processes user sync events.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Webhook } from 'svix';

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3002;
const DB_BASE_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

// Middleware for raw body parsing (required for webhook signature verification)
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cors());

/**
 * Verify webhook signature using Clerk's webhook secret
 */
function verifyWebhookSignature(payload, headers) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  
  if (!webhookSecret) {
    throw new Error('CLERK_WEBHOOK_SIGNING_SECRET is not configured');
  }

  try {
    const wh = new Webhook(webhookSecret);
    return wh.verify(payload, headers);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Fetch current users from JSON Server
 */
async function getCurrentUsers() {
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
function transformClerkUserToLocal(clerkUser) {
  const primaryEmail = clerkUser.email_addresses?.[0]?.email_address || '';
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
async function createUser(userData) {
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
async function updateUser(clerkId, userData) {
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
async function deleteUser(clerkId) {
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
async function handleUserCreated(userData) {
  console.log('🔄 Processing user.created event:', userData.id);
  
  const localUserData = transformClerkUserToLocal(userData);
  return await createUser(localUserData);
}

/**
 * Handle user.updated event
 */
async function handleUserUpdated(userData) {
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
async function handleUserDeleted(clerkId) {
  console.log('🔄 Processing user.deleted event:', clerkId);
  
  return await deleteUser(clerkId);
}

/**
 * Main webhook endpoint
 */
app.post('/webhook/clerk', async (req, res) => {
  console.log('🎯 Received Clerk webhook request');
  
  try {
    // Get raw body and headers
    const payload = req.body;
    const headers = {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    };

    // Verify webhook signature
    const event = verifyWebhookSignature(payload, headers);
    
    console.log('✅ Webhook signature verified, event type:', event.type);
    
    let success = false;
    let message = '';

    // Handle different event types
    switch (event.type) {
      case 'user.created':
        success = await handleUserCreated(event.data);
        message = success ? 'User created successfully' : 'Failed to create user';
        break;
        
      case 'user.updated':
        success = await handleUserUpdated(event.data);
        message = success ? 'User updated successfully' : 'Failed to update user';
        break;
        
      case 'user.deleted':
        success = await handleUserDeleted(event.data.id);
        message = success ? 'User deleted successfully' : 'Failed to delete user';
        break;
        
      default:
        console.log('🤷 Unhandled webhook event type:', event.type);
        return res.status(200).json({
          success: true,
          message: `Event type ${event.type} not handled but acknowledged`
        });
    }

    const statusCode = success ? 200 : 500;
    console.log(`${success ? '✅' : '❌'} Webhook processing result:`, message);
    
    res.status(statusCode).json({
      success,
      message,
      eventType: event.type,
      userId: event.data.id
    });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    const statusCode = error.message.includes('signature') ? 401 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message,
      error: 'Webhook processing failed'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'clerk-webhook-server'
  });
});

/**
 * Manual sync endpoint for testing
 */
app.post('/sync/test', async (req, res) => {
  console.log('🧪 Manual sync test triggered');
  
  try {
    const { userId, action = 'create' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    // Mock user data for testing
    const mockUserData = {
      id: userId,
      email_addresses: [{ email_address: `test-${userId}@example.com` }],
      first_name: 'Test',
      last_name: 'User',
      image_url: '',
      username: `test-${userId}`,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    let success = false;
    let message = '';

    switch (action) {
      case 'create':
        success = await handleUserCreated(mockUserData);
        message = success ? 'Test user created' : 'Failed to create test user';
        break;
      case 'update':
        success = await handleUserUpdated(mockUserData);
        message = success ? 'Test user updated' : 'Failed to update test user';
        break;
      case 'delete':
        success = await handleUserDeleted(userId);
        message = success ? 'Test user deleted' : 'Failed to delete test user';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use: create, update, or delete'
        });
    }

    res.status(success ? 200 : 500).json({
      success,
      message,
      action,
      userId
    });
    
  } catch (error) {
    console.error('❌ Manual sync test error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: 'Manual sync test failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Clerk Webhook Server started');
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook/clerk`);
  console.log(`💓 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/sync/test`);
  console.log('');
  console.log('Environment check:');
  console.log('- CLERK_WEBHOOK_SIGNING_SECRET:', process.env.CLERK_WEBHOOK_SIGNING_SECRET ? '✅ Set' : '❌ Missing');
  console.log('- JSON_SERVER_URL:', DB_BASE_URL);
  console.log('');
});

export default app;