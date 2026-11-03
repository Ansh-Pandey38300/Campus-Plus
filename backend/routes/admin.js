const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');

const {
  getComplaints,
  moderateComplaint,
  getUsers,
  unblockUser
} = require('../controllers/adminController');

// Every route in this file requires administrator access.
router.use('/admin', authenticateToken);
router.use('/admin', authorizeRole('admin'));

// View complaints.
router.get('/admin/complaints', getComplaints);
router.get('/admin/users', getUsers);
//unblock user
router.patch(
  '/admin/users/:userId/unblock',
  unblockUser
);

// Warn or temporarily block a user.
router.post(
  '/admin/complaints/:complaintId/moderate',
  moderateComplaint
);

module.exports = router;