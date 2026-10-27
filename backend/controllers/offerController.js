
const asyncHandler = require('../utils/asyncHandler');
const offerService = require('../services/offerService');

const submitOffer = asyncHandler(async (req, res) => {
  const result = await offerService.submitOffer(
    req.params.requestId,
    req.user.id,
    req.body
  );

  res.status(result.action === 'created' ? 201 : 200).json({
    message:
      result.action === 'created'
        ? 'Offer submitted successfully.'
        : 'Offer revised successfully.',
    ...result
  });
});

const listOffers = asyncHandler(async (req, res) => {
  const offers = await offerService.listOffers(
    req.params.requestId
  );

  res.status(200).json({
    count: offers.length,
    offers
  });
});

const getMyOffer = asyncHandler(async (req, res) => {
  const offer = await offerService.getMyOffer(
    req.params.requestId,
    req.user.id
  );

  res.status(200).json({ offer });
});

const getOfferHistory = asyncHandler(async (req, res) => {
  const history = await offerService.getOfferHistory(
    req.params.offerId,
    req.user.id
  );

  res.status(200).json({
    count: history.length,
    history
  });
});

module.exports = {
  submitOffer,
  listOffers,
  getMyOffer,
  getOfferHistory
};
