# Edit Webhook Endpoint Configuration

To edit your webhook endpoint configuration:

1. In the Clerk Dashboard, navigate to the [**Webhooks**](https://dashboard.clerk.com/last-active?path=webhooks) page <sup><a href="#">1</a></sup>.

2. Select your webhook endpoint (the one with ID `ep_2yp73eNE1ax2SsQiIgEMjwydWzJ`) to access its settings page.

3. In the **Subscribe to events** section, unselect all currently selected events .

4. Select only the 3 user events you need:

   - `user.created` - Triggers when a new user registers in the app or is created via the Clerk Dashboard or Backend API
   - `user.updated` - Triggers when user information is updated via Clerk components, the Clerk Dashboard, or Backend API
   - `user.deleted` - Triggers when a user deletes their account, or their account is removed via the Clerk Dashboard or Backend API

5. Select **Create** to apply the changes .

This configuration ensures your webhook endpoint only receives the specific user events you need, which helps minimize server resource usage <sup><a href="#">5</a></sup>.
