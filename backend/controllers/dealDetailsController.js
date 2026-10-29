const asyncHandler = require('../utils/asyncHandler');
const dealDetailsService = require('../services/dealDetailsService');

const getDealDetails = asyncHandler(async (req, res) => {
  const details = await dealDetailsService.getDealDetails(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    status: 'success',
    ...details
  });
});

module.exports = { getDealDetails };
