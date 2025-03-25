# Microsoft Sentinel Integration API

This Node.js application provides an API to interact with Microsoft Sentinel, allowing you to register applications with Azure AD and manage hunting queries.

## Prerequisites

- Node.js 14 or higher
- An Azure subscription with Microsoft Sentinel enabled
- An Azure AD application with the following permissions:
  - Microsoft Graph API: Application.ReadWrite.All (for app registration)
  - Azure Service Management API: user_impersonation (for Sentinel operations)

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:

```
# Azure AD App Registration details
AZURE_TENANT_ID=your_tenant_id
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret

# Microsoft Sentinel Workspace details
WORKSPACE_NAME=your_workspace_name
WORKSPACE_ID=your_workspace_id
WORKSPACE_RESOURCE_GROUP=your_resource_group
SUBSCRIPTION_ID=your_subscription_id
```

## Fixing the "Insufficient privileges" Error

The "Insufficient privileges" error occurs when your service principal doesn't have the necessary permissions to create applications in Azure AD. To fix this:

1. Go to the Azure Portal
2. Navigate to Azure Active Directory
3. Select "App registrations" and find your application
4. Go to "API permissions"
5. Add the following permission:
   - Microsoft Graph API: Application.ReadWrite.All
6. Click "Grant admin consent" for your directory

This permission requires admin consent and cannot be granted by regular users.

## Sentinel API Authorization

For Microsoft Sentinel operations, the application uses Azure Resource Manager (ARM) APIs with the following authorization:

1. The application needs the `user_impersonation` permission for the Azure Service Management API
2. The service principal must have the appropriate RBAC role assignments on the Sentinel workspace:
   - For read operations: "Microsoft Sentinel Reader" role
   - For write operations: "Microsoft Sentinel Contributor" role

To assign these roles:
1. Go to your Microsoft Sentinel workspace in the Azure Portal
2. Click on "Access control (IAM)"
3. Click "Add role assignment"
4. Select the appropriate role
5. Assign it to your application's service principal

## Usage

Start the server:

```
npm start
```

The API will be available at http://localhost:3000.

## API Endpoints

- `GET /api/app-info`: Get information about the registered application
- `GET /api/hunting-queries`: Get all hunting queries
- `POST /api/hunting-queries`: Create a new hunting query from JSON input
- `POST /api/hunting-queries/upload`: Create a new hunting query from a KQL file
- `POST /api/hunting-queries/run`: Run a hunting query and get results

## KQL File Format

KQL files should follow this format:

```
// Metadata:
// Name: My Hunting Query
// Description: This query detects suspicious activity
// Tactics: InitialAccess, Execution
// Techniques: T1190, T1204

// Query:
SecurityEvent
| where EventID == 4624
| where AccountType == "User"
| project TimeGenerated, Account, Computer
```

## License

MIT
