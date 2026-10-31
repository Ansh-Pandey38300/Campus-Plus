
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');

const {
  submitRating,
  getDealRating
} = require('../controllers/ratingController');

// Submit seller rating.
router.post(
  '/ratings',
  authenticateToken,
  submitRating
);

// Get rating of a deal.
router.get(
  '/ratings/deals/:dealId',
  authenticateToken,
  getDealRating
);

module.exports = router;
