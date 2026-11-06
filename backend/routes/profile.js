
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');

const {
  getMyProfile
} = require('../controllers/profileController');

// Get the logged-in user's complete profile.
router.get(
  '/profile/me',
  authenticateToken,
  getMyProfile
);

module.exports = router;

