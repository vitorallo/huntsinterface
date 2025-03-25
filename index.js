const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createQueryFromFile, createQueryFromInput } = require('./hunting-queries');
const { getHuntingQueries, runHuntingQuery } = require('./sentinel-client');
const { getApplicationInfo } = require('./graph-client');
const { registerApplication, addSentinelPermissions } = require('./app-registration');

// Set up Express app
const app = express();
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.kql') {
      return cb(new Error('Only .kql files are allowed'));
    }
    cb(null, true);
  }
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Register a new application
app.post('/api/register-app', async (req, res) => {
  try {
    const { appName, redirectUris } = req.body;
    
    if (!appName) {
      return res.status(400).json({ error: 'Application name is required' });
    }
    
    // Register the application
    const app = await registerApplication(appName, redirectUris || []);
    
    // Add Sentinel permissions
    await addSentinelPermissions(app.id);
    
    res.status(201).json({
      message: 'Application registered successfully',
      appId: app.appId,
      objectId: app.id,
      displayName: app.displayName
    });
  } catch (error) {
    console.error('Error registering application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get application info
app.get('/api/app-info', async (req, res) => {
  try {
    const appInfo = await getApplicationInfo();
    res.json(appInfo);
  } catch (error) {
    console.error('Error getting app info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all hunting queries
app.get('/api/hunting-queries', async (req, res) => {
  try {
    const queries = await getHuntingQueries();
    res.json(queries);
  } catch (error) {
    console.error('Error getting hunting queries:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a hunting query from direct input
app.post('/api/hunting-queries', async (req, res) => {
  try {
    const result = await createQueryFromInput(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating hunting query:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload and create a hunting query from a KQL file
app.post('/api/hunting-queries/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const result = await createQueryFromFile(req.file.path);
    
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    
    // Clean up the uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Run a hunting query
app.post('/api/hunting-queries/run', async (req, res) => {
  try {
    const { query, timespan } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const result = await runHuntingQuery(query, timespan);
    res.json(result);
  } catch (error) {
    console.error('Error running hunting query:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
