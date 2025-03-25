const axios = require('axios');
const { getSentinelToken } = require('./auth');
const config = require('./config');

// Base URL for Azure Resource Manager API
const baseUrl = 'https://management.azure.com';

// Get headers with authorization token
const getHeaders = async () => {
  const token = await getSentinelToken();
  return {
    'Authorization': `Bearer ${token.token}`,
    'Content-Type': 'application/json'
  };
};

// Get all hunting queries in a workspace
const getHuntingQueries = async () => {
  const headers = await getHeaders();
  const url = `${baseUrl}/subscriptions/${config.sentinel.subscriptionId}/resourceGroups/${config.sentinel.resourceGroup}/providers/Microsoft.OperationalInsights/workspaces/${config.sentinel.workspaceId}/providers/Microsoft.SecurityInsights/huntingQueries?api-version=2021-10-01-preview`;
  
  try {
    const response = await axios.get(url, { headers });
    return response.data.value;
  } catch (error) {
    console.error('Error getting hunting queries:', error);
    throw error;
  }
};

// Create a new hunting query
const createHuntingQuery = async (queryData) => {
  const headers = await getHeaders();
  const queryName = queryData.displayName.replace(/\s+/g, '');
  const url = `${baseUrl}/subscriptions/${config.sentinel.subscriptionId}/resourceGroups/${config.sentinel.resourceGroup}/providers/Microsoft.OperationalInsights/workspaces/${config.sentinel.workspaceId}/providers/Microsoft.SecurityInsights/huntingQueries/${queryName}?api-version=2021-10-01-preview`;
  
  try {
    const response = await axios.put(url, queryData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error creating hunting query:', error);
    throw error;
  }
};

module.exports = {
  getHuntingQueries,
  createHuntingQuery
};
