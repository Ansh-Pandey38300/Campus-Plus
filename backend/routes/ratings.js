
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');

const {
  submitRating,
  getDealRating,
  getSellerRatings
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

// Get all reviews submitted for a seller.
router.get(
  '/ratings/sellers/:sellerId',
  authenticateToken,
  getSellerRatings
);

module.exports = router;
