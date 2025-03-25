const fs = require('fs');
const path = require('path');
const { createHuntingQuery } = require('./sentinel-client');

// Parse a KQL file and extract metadata and query
const parseKqlFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const metadata = {};
  let queryLines = [];
  let inMetadata = false;
  let inQuery = false;
  
  for (const line of lines) {
    if (line.trim() === '// Metadata:') {
      inMetadata = true;
      inQuery = false;
      continue;
    } else if (line.trim() === '// Query:') {
      inMetadata = false;
      inQuery = true;
      continue;
    }
    
    if (inMetadata) {
      const match = line.match(/\/\/\s*(\w+):\s*(.*)/);
      if (match) {
        const [, key, value] = match;
        if (key === 'Tactics' || key === 'Techniques') {
          metadata[key.toLowerCase()] = value.split(',').map(item => item.trim());
        } else {
          metadata[key.toLowerCase()] = value.trim();
        }
      }
    } else if (inQuery) {
      queryLines.push(line);
    }
  }
  
  return {
    name: metadata.name || path.basename(filePath, '.kql'),
    description: metadata.description || '',
    tactics: metadata.tactics || [],
    techniques: metadata.techniques || [],
    query: queryLines.join('\n').trim()
  };
};

// Create a hunting query from a KQL file
const createQueryFromFile = async (filePath) => {
  try {
    const queryData = parseKqlFile(filePath);
    return await createHuntingQuery(queryData);
  } catch (error) {
    console.error(`Error creating query from file ${filePath}:`, error);
    throw error;
  }
};

// Create a hunting query from direct input
const createQueryFromInput = async (queryData) => {
  try {
    return await createHuntingQuery(queryData);
  } catch (error) {
    console.error('Error creating query from input:', error);
    throw error;
  }
};

module.exports = {
  parseKqlFile,
  createQueryFromFile,
  createQueryFromInput
};
