require('dotenv').config();

module.exports = {
  azure: {
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  },
  sentinel: {
    workspaceName: process.env.WORKSPACE_NAME,
    workspaceId: process.env.WORKSPACE_ID,
    resourceGroup: process.env.WORKSPACE_RESOURCE_GROUP,
    subscriptionId: process.env.SUBSCRIPTION_ID
  },
  scopes: {
    graph: ['https://graph.microsoft.com/.default'],
    sentinel: ['https://management.azure.com/.default']
  }
};
