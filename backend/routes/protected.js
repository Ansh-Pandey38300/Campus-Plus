
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

const {
  getMe,
  adminCheck
} = require('../controllers/userController');

// Any authenticated user.
router.get(
  '/auth/me',
  authenticateToken,
  getMe
);

// Only administrators.
router.get(
  '/admin/check',
  authenticateToken,
  authorizeRole('admin'),
  adminCheck
);

module.exports = router;
