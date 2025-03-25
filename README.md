# Microsoft Sentinel Integration

This Node.js application demonstrates how to register as a Microsoft Azure Enterprise app and interact with Microsoft Sentinel to publish hunting queries.

## Prerequisites

- Azure subscription with Microsoft Sentinel enabled
- Permissions to create Azure AD applications
- Node.js and npm installed

## Setup

1. Create an Azure AD App Registration in the Azure Portal:
   - Navigate to Azure Active Directory > App registrations > New registration
   - Name your application
   - Set the supported account type to "Accounts in this organizational directory only"
   - Add a redirect URI (Web) if needed
   - Note the Application (client) ID and Directory (tenant) ID

2. Create a client secret:
   - In your app registration, go to "Certificates & secrets"
   - Create a new client secret and note its value

3. Grant API permissions:
   - In your app registration, go to "API permissions"
   - Add the following permissions:
     - Microsoft Graph: User.Read (delegated)
     - Azure Security Insights API: SecurityInsights.ReadWrite.All (application)
     - Azure Service Management: user_impersonation (delegated)
   - Click "Grant admin consent"

4. Update the `.env` file with your details:
   ```
   AZURE_TENANT_ID=your_tenant_id
   AZURE_CLIENT_ID=your_client_id
   AZURE_CLIENT_SECRET=your_client_secret
   WORKSPACE_ID=your_workspace_id
   WORKSPACE_RESOURCE_GROUP=your_resource_group
   SUBSCRIPTION_ID=your_subscription_id
   ```

## Running the Application

1. Install dependencies:
   ```
   npm install
   ```

2. Start the application:
   ```
   npm start
   ```

3. The server will start on port 3000 (or the port specified in the PORT environment variable)

## API Endpoints

- `POST /register-app`: Register a new Azure AD application
- `POST /add-sentinel-permissions`: Add Microsoft Sentinel permissions to the app
- `POST /create-hunting-query`: Create a sample hunting query
- `GET /hunting-queries`: List all hunting queries

## Architecture

This application uses:
- Microsoft Graph API for Azure AD application management
- Azure Management API for Microsoft Sentinel operations
- @azure/identity for authentication
- Express for the API server

## Security Considerations

- Store credentials securely (not in code)
- Use managed identities when possible in production
- Implement proper error handling and logging
- Follow the principle of least privilege when assigning permissions
