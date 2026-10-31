
const asyncHandler = require('../utils/asyncHandler');
const ratingService = require('../services/ratingService');

const submitRating = asyncHandler(async (req, res) => {
  const { deal_id, stars, comment } = req.body;

  const rating = await ratingService.submitRating(
    deal_id,
    req.user.id,
    stars,
    comment
  );

  res.status(201).json({
    status: 'success',
    message: 'Seller rating submitted successfully.',
    rating
  });
});

const getDealRating = asyncHandler(async (req, res) => {
  const result = await ratingService.getDealRating(
    req.params.dealId,
    req.user.id
  );

  res.status(200).json({
    status: 'success',
    data: result
  });
});

module.exports = {
  submitRating,
  getDealRating
};
