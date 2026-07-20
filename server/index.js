const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize database tables
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS hypotheses (
        id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Database tables initialized');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  } finally {
    client.release();
  }
}

initDB();

// Helper: Get all hypotheses
async function getAllHypotheses() {
  try {
    const result = await pool.query(
      'SELECT data FROM hypotheses ORDER BY created_at DESC'
    );
    const hypotheses = result.rows.map(row => row.data);
    return { hypotheses, lastUpdated: new Date().toISOString() };
  } catch (err) {
    console.error('Error getting hypotheses:', err);
    return { hypotheses: [], lastUpdated: null };
  }
}

// Helper: Get single hypothesis
async function getHypothesisById(id) {
  try {
    const result = await pool.query(
      'SELECT data FROM hypotheses WHERE id = $1',
      [id]
    );
    return result.rows[0]?.data || null;
  } catch (err) {
    console.error('Error getting hypothesis:', err);
    return null;
  }
}

// Helper: Save hypothesis
async function saveHypothesis(hypothesis) {
  try {
    const jsonData = JSON.stringify(hypothesis);
    await pool.query(
      `INSERT INTO hypotheses (id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      [hypothesis.id, jsonData]
    );
    return true;
  } catch (err) {
    console.error('Error saving hypothesis:', err);
    return false;
  }
}

// Helper: Delete hypothesis
async function deleteHypothesis(id) {
  try {
    await pool.query('DELETE FROM hypotheses WHERE id = $1', [id]);
    return true;
  } catch (err) {
    console.error('Error deleting hypothesis:', err);
    return false;
  }
}

// API Routes
app.get('/api/hypotheses', async (req, res) => {
  const data = await getAllHypotheses();
  res.json(data);
});

app.get('/api/hypotheses/:id', async (req, res) => {
  const hypothesis = await getHypothesisById(req.params.id);
  if (!hypothesis) {
    return res.status(404).json({ error: 'Hypothesis not found' });
  }
  res.json(hypothesis);
});

app.post('/api/hypotheses', async (req, res) => {
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

  if (await saveHypothesis(newHypothesis)) {
    res.status(201).json(newHypothesis);
  } else {
    res.status(500).json({ error: 'Failed to save hypothesis' });
  }
});

app.put('/api/hypotheses/:id', async (req, res) => {
  const existing = await getHypothesisById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Hypothesis not found' });
  }

  const updates = req.body;
  if (updates.content && !updates.titleExplicitlySet) {
    const words = updates.content.trim().split(/\s+/).slice(0, 5);
    updates.title = words.join(' ') + (updates.content.trim().split(/\s+/).length > 5 ? '...' : '');
  }

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (await saveHypothesis(updated)) {
    res.json(updated);
  } else {
    res.status(500).json({ error: 'Failed to update hypothesis' });
  }
});

app.delete('/api/hypotheses/:id', async (req, res) => {
  const existing = await getHypothesisById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Hypothesis not found' });
  }

  if (await deleteHypothesis(req.params.id)) {
    res.json({ message: 'Hypothesis deleted', id: req.params.id });
  } else {
    res.status(500).json({ error: 'Failed to delete hypothesis' });
  }
});

app.post('/api/hypotheses/:id/timeline', async (req, res) => {
  const hypothesis = await getHypothesisById(req.params.id);
  if (!hypothesis) {
    return res.status(404).json({ error: 'Hypothesis not found' });
  }

  const timelineUpdate = {
    id: uuidv4(),
    date: new Date().toISOString(),
    content: req.body.content
  };

  if (!hypothesis.timeline) {
    hypothesis.timeline = [];
  }
  hypothesis.timeline.push(timelineUpdate);
  hypothesis.updatedAt = new Date().toISOString();

  if (await saveHypothesis(hypothesis)) {
    res.json(timelineUpdate);
  } else {
    res.status(500).json({ error: 'Failed to add timeline update' });
  }
});

app.get('/api/hypotheses/random', async (req, res) => {
  const data = await getAllHypotheses();
  if (data.hypotheses.length === 0) {
    return res.status(404).json({ error: 'No hypotheses found' });
  }
  const randomIndex = Math.floor(Math.random() * data.hypotheses.length);
  res.json(data.hypotheses[randomIndex]);
});

app.get('/api/export', async (req, res) => {
  const data = await getAllHypotheses();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=hypotheses-backup-${Date.now()}.json`);
  res.json(data);
});

app.post('/api/import', async (req, res) => {
  const importedData = req.body;

  if (!importedData || !Array.isArray(importedData.hypotheses)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  let saved = 0;
  for (const h of importedData.hypotheses) {
    if (await saveHypothesis(h)) saved++;
  }

  res.json({ message: 'Data imported successfully', count: saved });
});

app.get('/api/sync', async (req, res) => {
  const data = await getAllHypotheses();
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

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.json({ status: 'ok', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// Serve frontend in production
if (IS_PRODUCTION) {
  const fs = require('fs');
  const path = require('path');
  const FRONTEND_DIST = path.join(__dirname, '..', 'dist');

  if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Hipotesa Journal running on http://0.0.0.0:${PORT}`);
  console.log(`🗄️ Database: PostgreSQL`);
});
