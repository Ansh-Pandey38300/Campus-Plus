
const AppError = require('../utils/AppError');
const offerModel = require('../models/offerModel');

function parsePositiveId(value, label) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(`Invalid ${label}.`, 400);
  }

  return id;
}

async function selectOffer(offerIdValue, buyerIdValue) {
  const offerId = parsePositiveId(offerIdValue, 'offer ID');
  const buyerId = parsePositiveId(buyerIdValue, 'buyer ID');

  return offerModel.withTransaction(async (connection) => {
    // Find the request associated with this offer.
    const initialOffer =
      await offerModel.getOfferRequestId(connection, offerId);

    if (!initialOffer) {
      throw new AppError('Offer not found.', 404);
    }

    // Lock the request first to serialize selections for it.
    const request =
      await offerModel.getRequestForSelection(
        connection,
        initialOffer.request_id
      );

    if (!request) {
      throw new AppError('Request not found.', 404);
    }

    if (Number(request.buyer_id) !== buyerId) {
      throw new AppError(
        'Only the request owner can select an offer.',
        403
      );
    }

    if (request.status !== 'open') {
      throw new AppError(
        'Only open requests can have an offer selected.',
        409
      );
    }

    if (Number(request.is_expired) === 1) {
      throw new AppError(
        'The request deadline has passed.',
        409
      );
    }

    const offer =
      await offerModel.getOfferForSelection(
        connection,
        offerId
      );

    if (
      !offer ||
      Number(offer.request_id) !== Number(request.id)
    ) {
      throw new AppError(
        'Offer does not belong to this request.',
        409
      );
    }

    if (Number(offer.seller_id) === buyerId) {
      throw new AppError(
        'You cannot select your own offer.',
        409
      );
    }

    const dealId = await offerModel.createDeal(connection, {
      requestId: request.id,
      offerId: offer.id,
      buyerId,
      sellerId: offer.seller_id,
      agreedAmount: offer.offered_price
    });

    await offerModel.closeRequest(connection, request.id);

    return {
      dealId,
      requestId: request.id,
      offerId: offer.id,
      buyerId,
      sellerId: offer.seller_id,
      agreedAmount: offer.offered_price,
      status: 'confirmed'
    };
  });
}

module.exports = {
  selectOffer
};
