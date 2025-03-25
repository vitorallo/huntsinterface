const { getGraphClient } = require('./graph-client');
const config = require('./config');

// Register a new application in Azure AD
const registerApplication = async (appName, redirectUris = []) => {
  const client = getGraphClient();
  
  const appRegistration = {
    displayName: appName,
    signInAudience: 'AzureADMyOrg',
    web: {
      redirectUris: redirectUris,
      implicitGrantSettings: {
        enableIdTokenIssuance: true,
        enableAccessTokenIssuance: true
      }
    },
    requiredResourceAccess: [
      {
        // Microsoft Graph
        resourceAppId: '00000003-0000-0000-c000-000000000000',
        resourceAccess: [
          {
            // User.Read
            id: 'e1fe6dd8-ba31-4d61-89e7-88639da4683d',
            type: 'Scope'
          }
        ]
      }
    ]
  };

  try {
    const result = await client.api('/applications').post(appRegistration);
    console.log('Application registered successfully:', result.appId);
    return result;
  } catch (error) {
    console.error('Error registering application:', error);
    throw error;
  }
};

// Add API permissions to the application
const addApiPermissions = async (appObjectId, permissions) => {
  const client = getGraphClient();
  
  try {
    const app = await client.api(`/applications/${appObjectId}`).get();
    
    // Add new permissions to existing ones
    const requiredResourceAccess = [
      ...(app.requiredResourceAccess || []),
      ...permissions
    ];
    
    // Update the application
    await client.api(`/applications/${appObjectId}`)
      .patch({ requiredResourceAccess });
    
    console.log('API permissions added successfully');
    return true;
  } catch (error) {
    console.error('Error adding API permissions:', error);
    throw error;
  }
};

// Add Microsoft Sentinel permissions
const addSentinelPermissions = async (appObjectId) => {
  // Azure Security Insights API permissions
  const sentinelPermissions = {
    resourceAppId: 'c39ef2d1-04ce-46dc-8b5f-e9a5c60f0fc9', // Azure Security Insights API
    resourceAccess: [
      {
        id: '4d374829-7e5f-4c7e-b8f8-7a17e86d685f', // SecurityInsights.ReadWrite.All
        type: 'Role'
      }
    ]
  };
  
  // Azure Service Management API permissions
  const managementPermissions = {
    resourceAppId: '797f4846-ba00-4fd7-ba43-dac1f8f63013', // Azure Service Management API
    resourceAccess: [
      {
        id: '41094075-9dad-400e-a0bd-54e686782033', // user_impersonation
        type: 'Scope'
      }
    ]
  };
  
  return await addApiPermissions(appObjectId, [sentinelPermissions, managementPermissions]);
};

module.exports = {
  registerApplication,
  addApiPermissions,
  addSentinelPermissions
};
