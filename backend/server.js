// Shared file: do not edit without asking the team leader.
// Every file in /routes that ends with .js is loaded automatically under /api,
// so nobody needs to edit this file to add their own routes.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
// // Parse incoming JSON request bodies.
// app.use(express.json());

app.use(express.json());
app.use(cors());

// Serve the frontend (open http://localhost:3000/pages/index.html)
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('/', (req, res) => res.redirect('/pages/index.html'));

// Health checks (used for the "hello API" setup task)
app.get('/api/hello', (req, res) => res.json({ message: 'Campus Plus API is running' }));
app.get('/api/health/db', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ db: 'connected' });
  } catch (err) {
    res.status(500).json({ db: 'error', message: err.message });
  }
});

// Auto-load every routes/*.js file under /api
const routesDir = path.join(__dirname, 'routes');
fs.readdirSync(routesDir)
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => app.use('/api', require(path.join(routesDir, file))));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
