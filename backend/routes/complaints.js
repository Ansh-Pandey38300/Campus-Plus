
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

const {
  createComplaint,
  getAllComplaints
} = require('../controllers/complaintController');

// Submit a complaint against a deal.
router.post(
  '/complaints',
  authenticateToken,
  createComplaint
);

// Only admins can view all complaints.
router.get(
  '/complaints',
  authenticateToken,
  authorizeRole('admin'),
  getAllComplaints
);

module.exports = router;
