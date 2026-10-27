
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');
const asyncHandler = require('../utils/asyncHandler');
const sellerItemController = require('../controllers/sellerItemController');

// List only the logged-in seller's items.
router.get(
  '/seller-items/my',
  authenticateToken,
  asyncHandler(sellerItemController.getMySellerItems)
);

// List active marketplace items with an optional category filter.
router.get(
  '/seller-items',
  asyncHandler(sellerItemController.listSellerItems)
);

// Add an item for the logged-in seller.
router.post(
  '/seller-items',
  authenticateToken,
  asyncHandler(sellerItemController.createSellerItem)
);

module.exports = router;
