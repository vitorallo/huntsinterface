const express = require('express');
const { registerApplication, addSentinelPermissions } = require('./app-registration');
const { getApplicationInfo } = require('./graph-client');
const { createSampleHuntingQuery, createCustomHuntingQuery, listHuntingQueries } = require('./hunting-queries');
const config = require('./config');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get('/', (req, res) => {
  res.send('Azure Sentinel Integration API');
});

// Register a new application
app.post('/register-app', async (req, res) => {
  try {
    const { appName, redirectUris } = req.body;
    const result = await registerApplication(appName || 'Sentinel Integration App', redirectUris);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Sentinel permissions to an existing app
app.post('/add-sentinel-permissions', async (req, res) => {
  try {
    const appInfo = await getApplicationInfo();
    if (!appInfo) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const result = await addSentinelPermissions(appInfo.id);
    res.json({ success: result, message: 'Permissions added. Admin consent required.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a sample hunting query
app.post('/create-sample-query', async (req, res) => {
  try {
    const result = await createSampleHuntingQuery();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a custom hunting query from JSON input
app.post('/create-hunting-query', async (req, res) => {
  try {
    const { displayName, query, description, tactics } = req.body;
    
    if (!displayName || !query) {
      return res.status(400).json({ error: 'Display name and query are required' });
    }
    
    const result = await createCustomHuntingQuery({
      displayName,
      query,
      description,
      tactics
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a hunting query from uploaded file
app.post('/create-hunting-query-from-file', upload.single('queryFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { displayName, description, tactics } = req.body;
    
    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' });
    }
    
    // Read the query from the uploaded file
    const query = fs.readFileSync(req.file.path, 'utf8');
    
    // Delete the temporary file
    fs.unlinkSync(req.file.path);
    
    // Create the hunting query
    const result = await createCustomHuntingQuery({
      displayName,
      query,
      description,
      tactics: tactics ? JSON.parse(tactics) : []
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all hunting queries
app.get('/hunting-queries', async (req, res) => {
  try {
    const queries = await listHuntingQueries();
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /register-app: Register a new Azure AD application');
  console.log('- POST /add-sentinel-permissions: Add Microsoft Sentinel permissions to the app');
  console.log('- POST /create-sample-query: Create a sample hunting query');
  console.log('- POST /create-hunting-query: Create a custom hunting query from JSON input');
  console.log('- POST /create-hunting-query-from-file: Create a hunting query from an uploaded file');
  console.log('- GET /hunting-queries: List all hunting queries');
});

// If running directly, show initial setup instructions
if (require.main === module) {
  console.log('\nSetup Instructions:');
  console.log('1. Create an Azure AD App Registration in the Azure Portal');
  console.log('2. Grant admin consent for the required permissions');
  console.log('3. Update the .env file with your app and workspace details');
  console.log('4. Restart the application');
}
