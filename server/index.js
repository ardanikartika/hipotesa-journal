const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'hypotheses.json');
const FRONTEND_DIST = path.join(__dirname, '..', 'dist');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend in production
if (IS_PRODUCTION && fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if not exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ hypotheses: [], lastUpdated: null }, null, 2));
}

// Helper function to read data
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { hypotheses: [], lastUpdated: null };
  }
}

// Helper function to write data
function writeData(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

// API Routes
app.get('/api/hypotheses', (req, res) => {
  const data = readData();
  res.json(data);
});

app.get('/api/hypotheses/:id', (req, res) => {
  const data = readData();
  const hypothesis = data.hypotheses.find(h => h.id === req.params.id);
  if (!hypothesis) {
    return res.status(404).json({ error: 'Hypothesis not found' });
  }
  res.json(hypothesis);
});

app.post('/api/hypotheses', (req, res) => {
  const data = readData();
  const newHypothesis = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!newHypothesis.title && newHypothesis.content) {
    const words = newHypothesis.content.trim().split(/\s+/).slice(0, 5);
    newHypothesis.title = words.join(' ') + (newHypothesis.content.trim().split(/\s+/).length > 5 ? '...' : '');
  }

  data.hypotheses.unshift(newHypothesis);

  if (writeData(data)) {
    res.status(201).json(newHypothesis);
  } else {
    res.status(500).json({ error: 'Failed to save hypothesis' });
  }
});

app.put('/api/hypotheses/:id', (req, res) => {
  const data = readData();
  const index = data.hypotheses.findIndex(h => h.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Hypothesis not found' });
  }

  const updates = req.body;
  if (updates.content && !updates.titleExplicitlySet) {
    const words = updates.content.trim().split(/\s+/).slice(0, 5);
    updates.title = words.join(' ') + (updates.content.trim().split(/\s+/).length > 5 ? '...' : '');
  }

  data.hypotheses[index] = {
    ...data.hypotheses[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (writeData(data)) {
    res.json(data.hypotheses[index]);
  } else {
    res.status(500).json({ error: 'Failed to update hypothesis' });
  }
});

app.delete('/api/hypotheses/:id', (req, res) => {
  const data = readData();
  const index = data.hypotheses.findIndex(h => h.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Hypothesis not found' });
  }

  const deleted = data.hypotheses.splice(index, 1)[0];

  data.hypotheses.forEach(h => {
    if (h.relatedIds && h.relatedIds.includes(req.params.id)) {
      h.relatedIds = h.relatedIds.filter(id => id !== req.params.id);
    }
  });

  if (writeData(data)) {
    res.json({ message: 'Hypothesis deleted', id: deleted.id });
  } else {
    res.status(500).json({ error: 'Failed to delete hypothesis' });
  }
});

app.post('/api/hypotheses/:id/timeline', (req, res) => {
  const data = readData();
  const index = data.hypotheses.findIndex(h => h.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Hypothesis not found' });
  }

  const timelineUpdate = {
    id: uuidv4(),
    date: new Date().toISOString(),
    content: req.body.content
  };

  if (!data.hypotheses[index].timeline) {
    data.hypotheses[index].timeline = [];
  }
  data.hypotheses[index].timeline.push(timelineUpdate);
  data.hypotheses[index].updatedAt = new Date().toISOString();

  if (writeData(data)) {
    res.json(timelineUpdate);
  } else {
    res.status(500).json({ error: 'Failed to add timeline update' });
  }
});

app.get('/api/hypotheses/random', (req, res) => {
  const data = readData();
  if (data.hypotheses.length === 0) {
    return res.status(404).json({ error: 'No hypotheses found' });
  }
  const randomIndex = Math.floor(Math.random() * data.hypotheses.length);
  res.json(data.hypotheses[randomIndex]);
});

app.get('/api/export', (req, res) => {
  const data = readData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=hypotheses-backup-${Date.now()}.json`);
  res.json(data);
});

app.post('/api/import', (req, res) => {
  const importedData = req.body;

  if (!importedData || !Array.isArray(importedData.hypotheses)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  if (writeData(importedData)) {
    res.json({ message: 'Data imported successfully', count: importedData.hypotheses.length });
  } else {
    res.status(500).json({ error: 'Failed to import data' });
  }
});

app.get('/api/sync', (req, res) => {
  const data = readData();
  const clientLastUpdate = req.query.lastUpdate;

  if (!clientLastUpdate) {
    return res.json(data);
  }

  const updatedHypotheses = data.hypotheses.filter(h =>
    new Date(h.updatedAt) > new Date(clientLastUpdate)
  );

  res.json({
    hypotheses: updatedHypotheses,
    lastUpdated: data.lastUpdated,
    totalCount: data.hypotheses.length
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes (SPA support)
if (IS_PRODUCTION && fs.existsSync(FRONTEND_DIST)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Hipotesa Journal running on http://0.0.0.0:${PORT}`);
  if (IS_PRODUCTION) {
    console.log(`📦 Production mode - serving static files from ${FRONTEND_DIST}`);
  }
  console.log(`📊 Data file: ${DATA_FILE}`);
});
