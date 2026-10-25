
const express = require('express');
const router = express.Router();

const requestController = require('../controllers/requestController');
const authenticateToken = require('../middleware/authenticateToken');
const asyncHandler = require('../utils/asyncHandler');

router.get(
  '/requests/categories',
  asyncHandler(requestController.getCategories)
);

router.get(
  '/requests',
  asyncHandler(requestController.getRequests)
);

router.post(
  '/requests',
  authenticateToken,
  asyncHandler(requestController.createRequest)
);

module.exports = router;
