const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Parse DATABASE_URL manually for better compatibility
function parseDatabaseUrl(url) {
  try {
    const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        user: match[1],
        password: match[2],
        host: match[3],
        port: match[4],
        database: match[5]
      };
    }
  } catch (e) {
    console.error('Failed to parse DATABASE_URL:', e);
  }
  return null;
}

let pool = null;
let dbReady = false;

function initPool() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('⚠️ DATABASE_URL not set, using fallback JSON storage');
    return;
  }

  const config = parseDatabaseUrl(dbUrl);
  if (config) {
    pool = new Pool({
      user: config.user,
      password: config.password,
      host: config.host,
      port: parseInt(config.port),
      database: config.database,
      ssl: {
        rejectUnauthorized: false
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL error:', err);
    });
  }
}

initPool();

// Fallback JSON file storage
const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'data', 'hypotheses.json');
const dataDir = path.dirname(DATA_FILE);

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ hypotheses: [] }));
  }
}
ensureDataDir();

function readJsonData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { hypotheses: [] };
  }
}

function writeJsonData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing JSON:', error);
    return false;
  }
}

// Initialize database tables
async function initDB() {
  if (!pool) {
    console.log('📁 Using JSON file storage (no database)');
    dbReady = true;
    return;
  }

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
    dbReady = true;
    console.log('✅ PostgreSQL connected and tables ready');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    console.log('📁 Falling back to JSON file storage');
    dbReady = true;
  } finally {
    client.release();
  }
}

// Start DB init async
initDB().catch(err => {
  console.error('DB init error:', err);
  dbReady = true;
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper: Get all hypotheses
async function getAllHypotheses() {
  if (pool && dbReady) {
    try {
      const result = await pool.query(
        'SELECT data FROM hypotheses ORDER BY created_at DESC'
      );
      const hypotheses = result.rows.map(row => row.data);
      return { hypotheses, lastUpdated: new Date().toISOString() };
    } catch (err) {
      console.error('PostgreSQL error, using JSON:', err);
    }
  }
  // Fallback to JSON
  const data = readJsonData();
  return data;
}

// Helper: Get single hypothesis
async function getHypothesisById(id) {
  if (pool && dbReady) {
    try {
      const result = await pool.query(
        'SELECT data FROM hypotheses WHERE id = $1',
        [id]
      );
      if (result.rows[0]) return result.rows[0].data;
    } catch (err) {
      console.error('PostgreSQL error:', err);
    }
  }
  // Fallback to JSON
  const data = readJsonData();
  return data.hypotheses.find(h => h.id === id) || null;
}

// Helper: Save hypothesis
async function saveHypothesis(hypothesis) {
  if (pool && dbReady) {
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
      console.error('PostgreSQL save error:', err);
    }
  }
  // Fallback to JSON
  const data = readJsonData();
  const index = data.hypotheses.findIndex(h => h.id === hypothesis.id);
  if (index >= 0) {
    data.hypotheses[index] = hypothesis;
  } else {
    data.hypotheses.unshift(hypothesis);
  }
  return writeJsonData(data);
}

// Helper: Delete hypothesis
async function deleteHypothesis(id) {
  if (pool && dbReady) {
    try {
      await pool.query('DELETE FROM hypotheses WHERE id = $1', [id]);
      return true;
    } catch (err) {
      console.error('PostgreSQL delete error:', err);
    }
  }
  // Fallback to JSON
  const data = readJsonData();
  data.hypotheses = data.hypotheses.filter(h => h.id !== id);
  return writeJsonData(data);
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
  const dbStatus = pool && dbReady ? 'connected' : 'fallback';
  res.json({ status: 'ok', database: dbStatus, timestamp: new Date().toISOString() });
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
  console.log(`📁 Storage: ${pool && dbReady ? 'PostgreSQL' : 'JSON file (fallback)'}`);
});
