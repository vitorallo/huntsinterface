const { createHuntingQuery, getHuntingQueries } = require('./sentinel-client');

// Sample hunting query template
const createQueryTemplate = (displayName, query, description, tactics) => {
  return {
    properties: {
      displayName,
      query,
      description,
      tactics,
      category: "Hunting Queries"
    }
  };
};

// Create a hunting query from user input
const createCustomHuntingQuery = async (queryData) => {
  const { displayName, query, description, tactics } = queryData;
  
  if (!displayName || !query) {
    throw new Error('Display name and query are required');
  }
  
  const huntingQuery = createQueryTemplate(
    displayName,
    query,
    description || `Hunting query: ${displayName}`,
    tactics || []
  );
  
  try {
    const result = await createHuntingQuery(huntingQuery);
    console.log('Hunting query created successfully:', result.name);
    return result;
  } catch (error) {
    console.error('Error creating hunting query:', error);
    throw error;
  }
};

// Create a sample hunting query
const createSampleHuntingQuery = async () => {
  const sampleQuery = createQueryTemplate(
    "Detect Suspicious Process Creation",
    `SecurityEvent
    | where EventID == 4688
    | where NewProcessName contains "powershell.exe" or NewProcessName contains "cmd.exe"
    | where CommandLine contains "-enc" or CommandLine contains "-encodedcommand"
    | project TimeGenerated, Computer, SubjectUserName, NewProcessName, CommandLine`,
    "This hunting query looks for suspicious process creation events that might indicate malicious PowerShell activity",
    ["InitialAccess", "Execution"]
  );
  
  try {
    const result = await createHuntingQuery(sampleQuery);
    console.log('Hunting query created successfully:', result.name);
    return result;
  } catch (error) {
    console.error('Error creating hunting query:', error);
    throw error;
  }
};

// List all hunting queries
const listHuntingQueries = async () => {
  try {
    const queries = await getHuntingQueries();
    console.log(`Found ${queries.length} hunting queries`);
    return queries;
  } catch (error) {
    console.error('Error listing hunting queries:', error);
    throw error;
  }
};

module.exports = {
  createSampleHuntingQuery,
  createCustomHuntingQuery,
  listHuntingQueries,
  createQueryTemplate
};
