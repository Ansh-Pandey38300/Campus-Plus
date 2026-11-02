const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/adminService');

const getComplaints = asyncHandler(async (req, res) => {
  const complaints = await adminService.getComplaints();

  res.status(200).json({
    status: 'success',
    count: complaints.length,
    data: complaints
  });
});

const moderateComplaint = asyncHandler(async (req, res) => {
  const result = await adminService.moderateComplaint({
    complaintId: Number(req.params.complaintId),
    adminId: req.user.id,
    userId: Number(req.body.user_id),
    type: req.body.type,
    days: req.body.days
  });

  res.status(200).json({
    status: 'success',
    message: 'Moderation action completed successfully.',
    data: result
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();

  const users = await adminService.getUsers(search);

  res.status(200).json({
    status: 'success',
    count: users.length,
    data: users
  });
});

const unblockUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new AppError('Invalid user ID.', 400);
  }

  const result = await adminService.unblockUser({
    userId,
    adminId: req.user.id
  });

  res.status(200).json({
    status: 'success',
    message: 'User unblocked successfully.',
    data: result
  });
});

module.exports = {
  getComplaints,
  moderateComplaint,
  getUsers,
  unblockUser
};