const asyncHandler = require('../utils/asyncHandler');
const myDealsService = require('../services/myDealsService');

const getMyDeals = asyncHandler(async (req, res) => {
  const deals = await myDealsService.getMyDeals(req.user.id);

  res.status(200).json({
    count: deals.length,
    deals
  });
});

module.exports = { getMyDeals };