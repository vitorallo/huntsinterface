require('isomorphic-fetch');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const { getCredential } = require('./auth');
const config = require('./config');

// Create Microsoft Graph client
const getGraphClient = () => {
  const credential = getCredential();
  
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: config.scopes.graph
  });

  return Client.initWithMiddleware({
    authProvider
  });
};

// Get application information
const getApplicationInfo = async () => {
  const client = getGraphClient();
  try {
    const app = await client.api('/applications')
      .filter(`appId eq '${config.azure.clientId}'`)
      .get();
    
    return app.value[0];
  } catch (error) {
    console.error('Error getting application info:', error);
    throw error;
  }
};

module.exports = {
  getGraphClient,
  getApplicationInfo
};
