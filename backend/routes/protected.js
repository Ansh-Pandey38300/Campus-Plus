const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

// Any authenticated user can access this endpoint.
router.get(
  '/auth/me',
  authenticateToken,
  (req, res) => {
    res.status(200).json({
      user: req.user
    });
  }
);

// Only administrators can access this endpoint.
router.get(
  '/admin/check',
  authenticateToken,
  authorizeRole('admin'),
  (req, res) => {
    res.status(200).json({
      message: 'Admin access granted.',
      user: req.user
    });
  }
);

module.exports = router;