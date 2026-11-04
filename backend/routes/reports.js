
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');
const { getReports } = require('../controllers/reportController');

// Only authenticated admins can access reports.
router.get(
  '/admin/reports',
  authenticateToken,
  authorizeRole('admin'),
  getReports
);

module.exports = router;
