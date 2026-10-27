
const asyncHandler = require('../utils/asyncHandler');
const requestDeadlineService = require('../services/requestDeadlineService');

const closeExpiredRequests = asyncHandler(async (req, res) => {
  const result = await requestDeadlineService.closeExpiredRequests();

  res.status(200).json({
    message: 'Expired requests processed successfully.',
    closedCount: result.closedCount
  });
});

module.exports = {
  closeExpiredRequests
};
