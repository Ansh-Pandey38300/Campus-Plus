
const AppError = require('../utils/AppError');
const offerModel = require('../models/offerModel');
const notificationService = require('./notificationService');

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

    // 1. Find the request associated with this offer.
    const initialOffer =
      await offerModel.getOfferRequestId(connection, offerId);

    if (!initialOffer) {
      throw new AppError('Offer not found.', 404);
    }

    // 2. Lock the request to prevent simultaneous selections.
    const request =
      await offerModel.getRequestForSelection(
        connection,
        initialOffer.request_id
      );

    if (!request) {
      throw new AppError('Request not found.', 404);
    }

    // 3. Only the request owner can select a winner.
    if (Number(request.buyer_id) !== buyerId) {
      throw new AppError(
        'Only the request owner can select an offer.',
        403
      );
    }

    // 4. Do not allow selection on closed requests.
    if (request.status !== 'open') {
      throw new AppError(
        'This request is already closed. A winner cannot be selected again.',
        409
      );
    }

    // 5. Check the deadline.
    if (Number(request.is_expired) === 1) {
      throw new AppError(
        'The request deadline has passed.',
        409
      );
    }

    // 6. Lock and verify the selected offer.
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

    // 7. Prevent the buyer from selecting their own offer.
    if (Number(offer.seller_id) === buyerId) {
      throw new AppError(
        'You cannot select your own offer.',
        409
      );
    }

    // 8. Create the confirmed deal.
    const dealId = await offerModel.createDeal(connection, {
      requestId: request.id,
      offerId: offer.id,
      buyerId,
      sellerId: offer.seller_id,
      agreedAmount: offer.offered_price
    });

    // 9. Create pending payment transaction.
    await offerModel.createPendingTransaction(connection, {
      dealId,
      amount: offer.offered_price
    });

    // 10. Create handover record.
    await offerModel.createHandoverRecord(
      connection,
      dealId
    );

    // 11. IMPORTANT: Close the request after winner selection.
    // This runs inside the same database transaction.
    await offerModel.closeRequest(
      connection,
      request.id
    );

    // 12. Notify the selected seller.
    await notificationService.createNotification(
      {
        userId: offer.seller_id,
        type: 'deal',
        message:
          'Congratulations! Your offer has been selected by the buyer.',
        referenceType: 'deal',
        referenceId: dealId
      },
      connection
    );

    // 13. Return the created deal.
    return {
      dealId,
      requestId: request.id,
      offerId: offer.id,
      buyerId,
      sellerId: offer.seller_id,
      agreedAmount: offer.offered_price,
      status: 'confirmed',
      requestStatus: 'closed'
    };
  });
}

module.exports = {
  selectOffer
};
