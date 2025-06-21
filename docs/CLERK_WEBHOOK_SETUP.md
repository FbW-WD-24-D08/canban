# Clerk Webhook Setup Guide

Complete guide to implement Clerk-Frontend-Backend sync using webhooks.

## 🎯 Overview

This webhook system automatically syncs user data between Clerk authentication and your local JSON Server database. It handles:

- ✅ **User Creation**: New Clerk users automatically added to local database
- ✅ **User Updates**: Profile changes in Clerk sync to local database  
- ✅ **User Deletion**: Soft delete (mark inactive) when users are removed
- ✅ **Signature Verification**: Secure webhook processing with svix
- ✅ **Error Handling**: Comprehensive logging and fallback mechanisms

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# svix is already installed via npm install svix
npm install
```

### 2. Configure Environment Variables

Update your `.env` file with the webhook secret (you'll get this from Clerk Dashboard):

```env
# Existing Clerk Config
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YWNjZXB0ZWQtbGVtdXItMjEuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_ENHwzR7Rjpye10FfvzAVYMS9PujsTZAkmzNokbAiE4
VITE_CLERK_ORGANIZATION_ID=org_2yfncISYAk2BEKIUmPCKleyD2HP

# NEW: Webhook Configuration
CLERK_WEBHOOK_SIGNING_SECRET=whsec_REPLACE_WITH_ACTUAL_SECRET_FROM_CLERK_DASHBOARD
WEBHOOK_PORT=3002
JSON_SERVER_URL=http://localhost:3001
```

### 3. Start All Services

```bash
# Start all services (JSON Server + Webhook Server + Frontend)
npm run dev:full

# OR start individually:
npm run api      # JSON Server (port 3001)
npm run webhook  # Webhook Server (port 3002)  
npm run dev      # Frontend (port 5173)
```

---

## 🔧 Clerk Dashboard Configuration

### Step 1: Create Webhook Endpoint

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **Webhooks** section
3. Click **"Add Endpoint"**
4. Configure:

   ```
   Endpoint URL: http://localhost:3002/webhook/clerk
   ```

   **⚠️ For Production**: Use your actual domain:
   ```
   https://yourdomain.com/webhook/clerk
   ```

### Step 2: Select Events

Subscribe to these events:
- ✅ `user.created`
- ✅ `user.updated` 
- ✅ `user.deleted`

### Step 3: Get Signing Secret

1. After creating the webhook, copy the **Signing Secret**
2. It will look like: `whsec_ABC123...`
3. Update your `.env` file:

   ```env
   CLERK_WEBHOOK_SIGNING_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
   ```

### Step 4: Test the Webhook

1. In Clerk Dashboard, go to your webhook
2. Click **"Send Test Event"**
3. Choose `user.created` event
4. Check your terminal for webhook processing logs

---

## 🧪 Testing the Setup

### Method 1: Clerk Dashboard Test Events

1. In Clerk Dashboard → Webhooks → Your Webhook
2. Click **"Send Test Event"**
3. Select event type and send
4. Check terminal logs for processing confirmation

### Method 2: Manual API Testing

Test the webhook manually with curl:

```bash
# Test user creation
curl -X POST http://localhost:3002/sync/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123", "action": "create"}'

# Test user update  
curl -X POST http://localhost:3002/sync/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123", "action": "update"}'

# Test user deletion
curl -X POST http://localhost:3002/sync/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123", "action": "delete"}'
```

### Method 3: Health Check

```bash
curl http://localhost:3002/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-06-21T14:00:00.000Z",
  "service": "clerk-webhook-server"
}
```

---

## 📊 Monitoring and Logs

### Console Output

When the webhook server starts, you'll see:

```
🚀 Clerk Webhook Server started
📡 Listening on port 3002
🔗 Webhook endpoint: http://localhost:3002/webhook/clerk
💓 Health check: http://localhost:3002/health
🧪 Test endpoint: http://localhost:3002/sync/test

Environment check:
- CLERK_WEBHOOK_SIGNING_SECRET: ✅ Set
- JSON_SERVER_URL: http://localhost:3001
```

### Webhook Event Processing

When events are received:

```
🎯 Received Clerk webhook request
✅ Webhook signature verified, event type: user.created
🔄 Processing user.created event: user_ABC123
✅ User created successfully: user_ABC123
✅ Webhook processing result: User created successfully
```

---

## 🔍 Troubleshooting

### Issue: "CLERK_WEBHOOK_SIGNING_SECRET is not configured"

**Solution**: 
1. Ensure `.env` file has the webhook secret
2. Restart webhook server after adding the secret
3. Check that the secret starts with `whsec_`

### Issue: "Invalid webhook signature"

**Solutions**:
1. Verify the signing secret is correct in `.env`
2. Ensure you're sending real Clerk webhook events (not curl without proper headers)
3. Check that the webhook URL in Clerk Dashboard matches your server

### Issue: "Failed to fetch users" or "Failed to create user"

**Solutions**:
1. Ensure JSON Server is running on port 3001
2. Check `JSON_SERVER_URL` in `.env`
3. Verify JSON Server is accessible: `curl http://localhost:3001/users`

### Issue: Webhook events not being received

**Solutions**:
1. For local development, use ngrok to expose port 3002:
   ```bash
   ngrok http 3002
   ```
   Then use the ngrok URL in Clerk Dashboard: `https://abc123.ngrok.io/webhook/clerk`

2. Check Clerk Dashboard webhook logs for delivery attempts

### Issue: Database backup needed

```bash
# Create backup before testing
cp db/db.json db/db.json.backup-$(date +%Y%m%d-%H%M%S)
```

---

## 🏗️ Architecture Overview

### Components

1. **Webhook Server** (`webhook-server.js`)
   - Express server on port 3002
   - Handles Clerk webhook events
   - Verifies signatures with svix
   - Updates JSON Server database

2. **JSON Server** (port 3001)
   - Serves application data
   - Stores user profiles
   - Updated by webhook server

3. **Frontend** (port 5173)
   - React application
   - Uses Clerk for authentication
   - Reads user data from JSON Server

### Data Flow

```
Clerk Event → Webhook Server → JSON Server → Frontend
     ↓               ↓              ↓           ↓
User creates    Receives event   Updates DB   Displays
account         Verifies sig     via API      updated data
```

---

## 🔐 Security Features

### Signature Verification
- All webhooks verified using Clerk's signing secret
- Uses `svix` library for secure verification
- Rejects invalid or tampered requests

### Error Handling
- Comprehensive try-catch blocks
- Detailed error logging
- Appropriate HTTP status codes (200, 401, 500)

### Soft Deletion
- Users are marked `isActive: false` instead of being deleted
- Preserves data integrity
- Allows for user recovery

---

## 🚀 Production Deployment

### Environment Variables

Set these in your production environment:

```env
CLERK_WEBHOOK_SIGNING_SECRET=whsec_your_production_secret
WEBHOOK_PORT=3002
JSON_SERVER_URL=https://your-api-domain.com
```

### Webhook URL

Update Clerk Dashboard with your production webhook URL:
```
https://yourdomain.com/webhook/clerk
```

### Process Management

Use PM2 or similar for production:

```bash
# Install PM2
npm install -g pm2

# Start webhook server
pm2 start webhook-server.js --name "clerk-webhook"

# Monitor
pm2 status
pm2 logs clerk-webhook
```

---

## 📋 Next Steps

1. ✅ Complete setup using this guide
2. ✅ Test with Clerk Dashboard test events
3. ✅ Verify user sync in your application
4. ✅ Monitor logs for successful processing
5. ✅ Deploy to production with proper URLs

The webhook system will now automatically keep your Clerk users and local database in perfect sync! 🎉