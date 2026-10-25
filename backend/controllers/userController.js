
const asyncHandler = require('../utils/asyncHandler');

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: req.user
  });
});

const adminCheck = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: 'Admin access granted.',
    user: req.user
  });
});

module.exports = {
  getMe,
  adminCheck
};
