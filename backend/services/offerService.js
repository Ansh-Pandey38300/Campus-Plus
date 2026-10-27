
const AppError = require('../utils/AppError');
const offerModel = require('../models/offerModel');

function parsePositiveId(value, label) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(`Invalid ${label}.`, 400);
  }

  return id;
}

// Accept valid monetary amounts with at most two decimal places.
function parseMoney(value, label) {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    String(value).trim() === ''
  ) {
    throw new AppError(`${label} must be a valid amount.`, 400);
  }

  const text = String(value).trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) {
    throw new AppError(
      `${label} must have at most two decimal places.`,
      400
    );
  }

  const amount = Number(text);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError(`${label} must be greater than zero.`, 400);
  }

  if (amount > 99999999.99) {
    throw new AppError(`${label} exceeds the allowed limit.`, 400);
  }

  return Math.round(amount * 100);
}

function toDecimal(cents) {
  return (cents / 100).toFixed(2);
}

function parseDeadline(value) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value !== 'string') {
    return new Date(NaN);
  }

  // MySQL DATETIME commonly arrives as "YYYY-MM-DD HH:mm:ss".
  return new Date(value.replace(' ', 'T'));
}

function validateOfferNote(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new AppError('Offer note must be text.', 400);
  }

  const note = value.trim();

  if (note.length > 5000) {
    throw new AppError(
      'Offer note must not exceed 5000 characters.',
      400
    );
  }

  return note || null;
}

// Submit a first offer or revise the seller's existing offer.
async function submitOffer(requestIdValue, sellerIdValue, data) {
  const requestId = parsePositiveId(requestIdValue, 'request ID');
  const sellerId = parsePositiveId(sellerIdValue, 'seller ID');

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AppError('A valid offer body is required.', 400);
  }

  const offeredCents = parseMoney(
    data.offered_price,
    'Offered price'
  );

  const offeredPrice = toDecimal(offeredCents);
  const offerNote = validateOfferNote(data.offer_note);

  const result = await offerModel.withTransaction(async (connection) => {
    // Lock the request first. This serializes bidding operations
    // on the same request and reduces race conditions.
    const request = await offerModel.getRequestForUpdate(
      connection,
      requestId
    );

    if (!request) {
      throw new AppError('Request not found.', 404);
    }

    if (Number(request.buyer_id) === sellerId) {
      throw new AppError(
        'You cannot submit an offer on your own request.',
        403
      );
    }

    if (request.status !== 'open') {
      throw new AppError(
        'Offers are accepted only for open requests.',
        409
      );
    }

    const deadline = parseDeadline(request.deadline);

    if (
      Number.isNaN(deadline.getTime()) ||
      deadline.getTime() <= Date.now()
    ) {
      throw new AppError(
        'The bidding deadline has passed.',
        409
      );
    }

    const budgetCents = parseMoney(
      String(request.max_budget),
      'Request budget'
    );

    if (offeredCents > budgetCents) {
      throw new AppError(
        'Offered price cannot exceed the request maximum budget.',
        400
      );
    }

    const existingOffer =
      await offerModel.getSellerOfferForUpdate(
        connection,
        requestId,
        sellerId
      );

    const lowestCompetingPrice =
      await offerModel.getLowestCompetingOffer(
        connection,
        requestId,
        sellerId
      );

    if (existingOffer) {
      const previousCents = parseMoney(
        String(existingOffer.offered_price),
        'Previous offer price'
      );

      if (offeredCents >= previousCents) {
        throw new AppError(
          'A revised offer must be lower than your previous offer.',
          409
        );
      }

      if (
        lowestCompetingPrice !== null &&
        offeredCents >= parseMoney(
          String(lowestCompetingPrice),
          'Competing offer price'
        )
      ) {
        throw new AppError(
          'Your revised offer must be lower than the lowest competing offer.',
          409
        );
      }

      await offerModel.updateOffer(connection, {
        offerId: existingOffer.id,
        offeredPrice,
        offerNote
      });

      await offerModel.insertOfferHistory(connection, {
        offerId: existingOffer.id,
        previousPrice: toDecimal(previousCents),
        newPrice: offeredPrice,
        changedByUserId: sellerId
      });

      return {
        offerId: existingOffer.id,
        action: 'revised'
      };
    }

    if (
      lowestCompetingPrice !== null &&
      offeredCents >= parseMoney(
        String(lowestCompetingPrice),
        'Competing offer price'
      )
    ) {
      throw new AppError(
        'Your offer must be lower than the lowest competing offer.',
        409
      );
    }

    const offerId = await offerModel.insertOffer(connection, {
      requestId,
      sellerId,
      offeredPrice,
      offerNote
    });

    // The first history entry has no previous price.
    await offerModel.insertOfferHistory(connection, {
      offerId,
      previousPrice: null,
      newPrice: offeredPrice,
      changedByUserId: sellerId
    });

    return {
      offerId,
      action: 'created'
    };
  });

  const offer = await offerModel.getOfferById(result.offerId);

  return {
    action: result.action,
    offer
  };
}

// List all offers associated with a request.
async function listOffers(requestIdValue) {
  const requestId = parsePositiveId(requestIdValue, 'request ID');

  const offers = await offerModel.getOffersForRequest(requestId);

  return offers;
}

// Get the authenticated seller's own offer.
async function getMyOffer(requestIdValue, sellerIdValue) {
  const requestId = parsePositiveId(requestIdValue, 'request ID');
  const sellerId = parsePositiveId(sellerIdValue, 'seller ID');

  const offer = await offerModel.getSellerOffer(requestId, sellerId);

  if (!offer) {
    throw new AppError('You have not submitted an offer for this request.', 404);
  }

  return offer;
}

// Buyers can view the history of offers on their requests.
// Sellers can view the history of their own offers.
async function getOfferHistory(offerIdValue, userIdValue) {
  const offerId = parsePositiveId(offerIdValue, 'offer ID');
  const userId = parsePositiveId(userIdValue, 'user ID');

  const details = await offerModel.getOfferAccessDetails(offerId);

  if (!details) {
    throw new AppError('Offer not found.', 404);
  }

  const isBuyer = Number(details.buyer_id) === userId;
  const isSeller = Number(details.seller_id) === userId;

  if (!isBuyer && !isSeller) {
    throw new AppError(
      'You are not authorized to view this offer history.',
      403
    );
  }

  return offerModel.getOfferHistory(offerId);
}

module.exports = {
  submitOffer,
  listOffers,
  getMyOffer,
  getOfferHistory
};
