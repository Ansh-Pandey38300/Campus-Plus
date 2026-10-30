const asyncHandler = require('../utils/asyncHandler');
const handoverService = require('../services/handoverService');

const markHandedOver = asyncHandler(async (req, res) => {
  const result = await handoverService.markHandedOver(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    message: 'Handover marked successfully.',
    handover: result
  });
});

const confirmHandover = asyncHandler(async (req, res) => {
  const result = await handoverService.confirmHandover(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    message: 'Handover confirmed successfully.',
    handover: result
  });
});

module.exports = {
  markHandedOver,
  confirmHandover
};