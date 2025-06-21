// For development purposes, we'll use fetch directly to Clerk's API
// In production, this should be moved to a backend service

const CLERK_SECRET_KEY = 'sk_test_ENHwzR7Rjpye10FfvzAVYMS9PujsTZAkmzNokbAiE4';
const CLERK_API_BASE = 'https://api.clerk.com/v1';

const clerkFetch = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${CLERK_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Clerk API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export interface ClerkUser {
  id: string;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
  fullName?: string;
  createdAt: number;
  lastSignInAt?: number;
}

export const clerkApi = {
  /**
   * Search users by email address
   */
  searchUsersByEmail: async (email: string): Promise<ClerkUser[]> => {
    try {
      const response = await clerkFetch(`/users?email_address=${encodeURIComponent(email)}&limit=10`);

      return response.map((user: any) => ({
        id: user.id,
        emailAddress: user.email_addresses[0]?.email_address || '',
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        username: user.username,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
      }));
    } catch (error) {
      console.error('Clerk API: Error searching users:', error);
      throw error;
    }
  },

  /**
   * Search users by partial email (for autocomplete)
   */
  searchUsersAutoComplete: async (query: string): Promise<ClerkUser[]> => {
    try {
      
      // Get users with query parameter
      const response = await clerkFetch(`/users?query=${encodeURIComponent(query)}&limit=50`);

      const filteredUsers = response
        .filter((user: any) => {
          const email = user.email_addresses[0]?.email_address?.toLowerCase() || '';
          const firstName = user.first_name?.toLowerCase() || '';
          const lastName = user.last_name?.toLowerCase() || '';
          const username = user.username?.toLowerCase() || '';
          const queryLower = query.toLowerCase();

          return email.includes(queryLower) || 
                 firstName.includes(queryLower) || 
                 lastName.includes(queryLower) ||
                 username.includes(queryLower);
        })
        .slice(0, 10);


      return filteredUsers.map((user: any) => ({
        id: user.id,
        emailAddress: user.email_addresses[0]?.email_address || '',
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        username: user.username,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
      }));
    } catch (error) {
      console.error('Clerk API: Error in autocomplete search:', error);
      throw error;
    }
  },

  /**
   * Get user by exact email address
   */
  getUserByEmail: async (email: string): Promise<ClerkUser | null> => {
    try {
      
      const response = await clerkFetch(`/users?email_address=${encodeURIComponent(email)}&limit=1`);

      if (response.length === 0) {
        return null;
      }

      const user = response[0];

      return {
        id: user.id,
        emailAddress: user.email_addresses[0]?.email_address || '',
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        username: user.username,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
      };
    } catch (error) {
      console.error('Clerk API: Error getting user by email:', error);
      return null;
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<ClerkUser | null> => {
    try {
      
      const user = await clerkFetch(`/users/${userId}`);
      
      return {
        id: user.id,
        emailAddress: user.email_addresses[0]?.email_address || '',
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        username: user.username,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
      };
    } catch (error) {
      console.error('Clerk API: Error getting user by ID:', error);
      return null;
    }
  },

  /**
   * Get all users (for admin purposes)
   */
  getAllUsers: async (limit: number = 50): Promise<ClerkUser[]> => {
    try {
      const response = await clerkFetch(`/users?limit=${limit}&order_by=-created_at`);

      return response.map((user: any) => ({
        id: user.id,
        emailAddress: user.email_addresses[0]?.email_address || '',
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        username: user.username,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
      }));
    } catch (error) {
      console.error('Clerk API: Error getting all users:', error);
      throw error;
    }
  },
};