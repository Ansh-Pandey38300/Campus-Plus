# Routes

Create one file per module, for example `requests.js`. Every `.js` file here is loaded automatically at `/api`.

```js
const express = require('express');
const router = express.Router();
const db = require('../db');

// This becomes GET /api/requests
router.get('/requests', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM requests');
  res.json(rows);
});

module.exports = router;
```

Put the logic in `/backend/controllers` if it grows. Never edit `server.js` to add a route.
