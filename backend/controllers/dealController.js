
const asyncHandler = require('../utils/asyncHandler');
const dealService = require('../services/dealService');

const selectOffer = asyncHandler(async (req, res) => {
  const deal = await dealService.selectOffer(
    req.params.offerId,
    req.user.id
  );

  res.status(201).json({
    message: 'Offer selected and deal confirmed successfully.',
    deal
  });
});

module.exports = {
  selectOffer
};
