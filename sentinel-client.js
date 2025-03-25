const axios = require('axios');
const { getSentinelToken } = require('./auth');
const config = require('./config');

// Create the base URL for Azure Management API requests
const getBaseUrl = () => {
  const { subscriptionId, resourceGroup, workspaceName } = config.sentinel;
  return `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.OperationalInsights/workspaces/${workspaceName}`;
};

// Get hunting queries from Microsoft Sentinel
const getHuntingQueries = async () => {
  const token = await getSentinelToken();
  const baseUrl = getBaseUrl();
  // Using the latest API version for Saved Searches
  const url = `${baseUrl}/savedSearches?api-version=2020-08-01`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token.token}`
      }
    });
    return response.data.value;
  } catch (error) {
    console.error('Error getting hunting queries:', error.response?.data || error.message);
    throw error;
  }
};

// Create a new hunting query in Microsoft Sentinel
const createHuntingQuery = async (queryData) => {
  const token = await getSentinelToken();
  const baseUrl = getBaseUrl();
  const queryId = encodeURIComponent(queryData.name.replace(/\s+/g, '-').toLowerCase());
  // Using the latest API version for Saved Searches
  const url = `${baseUrl}/savedSearches/${queryId}?api-version=2020-08-01`;

  // Format the query data for the API
  const apiQueryData = {
    properties: {
      category: "Hunting Queries",
      displayName: queryData.name,
      query: queryData.query,
      description: queryData.description || "",
      tags: [
        { name: "description", value: queryData.description || "" }
      ]
    },
    etag: "*"
  };

  // Add tactics and techniques as tags if provided
  if (queryData.tactics && queryData.tactics.length > 0) {
    apiQueryData.properties.tags.push({ 
      name: "tactics", 
      value: queryData.tactics.join(',') 
    });
  }
  
  if (queryData.techniques && queryData.techniques.length > 0) {
    apiQueryData.properties.tags.push({ 
      name: "techniques", 
      value: queryData.techniques.join(',') 
    });
  }

  try {
    const response = await axios.put(url, apiQueryData, {
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating hunting query:', error.response?.data || error.message);
    throw error;
  }
};

// Run a hunting query and get results
const runHuntingQuery = async (query, timespan = 'P1D') => {
  const token = await getSentinelToken();
  const { subscriptionId, resourceGroup, workspaceName } = config.sentinel;
  
  // Using the Log Analytics query API
  const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups/${resourceGroup}/providers/Microsoft.OperationalInsights/workspaces/${workspaceName}/query?api-version=2020-08-01`;
  
  const requestBody = {
    query: query,
    timespan: timespan
  };

  try {
    const response = await axios.post(url, requestBody, {
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error running hunting query:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  getHuntingQueries,
  createHuntingQuery,
  runHuntingQuery
};
