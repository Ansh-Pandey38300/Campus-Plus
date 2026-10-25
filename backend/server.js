
/*
 * Shared file: get team-leader approval before editing.
 * Every .js file in /routes is automatically mounted under /api.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const db = require('./db');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// --------------------------------------------------
// 1. Validate essential environment configuration
// --------------------------------------------------

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured.');
}

if (!process.env.COLLEGE_EMAIL_DOMAINS) {
  throw new Error('COLLEGE_EMAIL_DOMAINS is not configured.');
}

// --------------------------------------------------
// 2. General middleware
// --------------------------------------------------

app.use(express.json());
app.use(cors());

// --------------------------------------------------
// 3. Serve the frontend
// --------------------------------------------------

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (req, res) => {
  res.redirect('/pages/index.html');
});

// --------------------------------------------------
// 4. Health-check endpoints
// --------------------------------------------------

app.get('/api/hello', (req, res) => {
  res.status(200).json({
    message: 'Campus Plus API is running'
  });
});

app.get('/api/health/db', async (req, res, next) => {
  try {
    await db.query('SELECT 1');

    res.status(200).json({
      db: 'connected'
    });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// 5. Automatically load route files
// --------------------------------------------------

const routesDir = path.join(__dirname, 'routes');

if (!fs.existsSync(routesDir)) {
  throw new Error(`Routes directory not found: ${routesDir}`);
}

const routeFiles = fs
  .readdirSync(routesDir)
  .filter((file) => file.endsWith('.js'))
  .sort();

for (const file of routeFiles) {
  const routePath = path.join(routesDir, file);
  const router = require(routePath);

  if (typeof router !== 'function') {
    throw new TypeError(
      `Route file "${file}" must export an Express router.`
    );
  }

  app.use('/api', router);

  console.log(`Loaded route: ${file}`);
}

// --------------------------------------------------
// 6. 404 handling
// --------------------------------------------------

// Handles requests that did not match any registered route.
app.use(notFoundMiddleware);

// --------------------------------------------------
// 7. Centralized error handling
// --------------------------------------------------

// Must be registered after routes and the 404 handler.
app.use(errorMiddleware);

// --------------------------------------------------
// 8. Start the server
// --------------------------------------------------

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown for database connections.
async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    try {
      if (typeof db.end === 'function') {
        await db.end();
      }

      console.log('Server shut down successfully.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
