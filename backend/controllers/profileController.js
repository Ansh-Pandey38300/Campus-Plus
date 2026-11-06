
const asyncHandler = require('../utils/asyncHandler');
const profileService = require('../services/profileService');

// GET /api/profile/me
const getMyProfile = asyncHandler(async (req, res) => {
  const result = await profileService.getMyProfile(
    req.user.id
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile fetched successfully.',
    data: result
  });
});

module.exports = {
  getMyProfile
};
