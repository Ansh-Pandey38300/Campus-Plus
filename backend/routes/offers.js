
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');

const {
  submitOffer,
  listOffers,
  getMyOffer,
  getOfferHistory
} = require('../controllers/offerController');

// Submit a new offer or revise the seller's existing offer.
router.post(
  '/offers/requests/:requestId',
  authenticateToken,
  submitOffer
);

// List offers for a request.
router.get(
  '/offers/requests/:requestId',
  authenticateToken,
  listOffers
);

// Get the current seller's offer for a request.
router.get(
  '/offers/requests/:requestId/mine',
  authenticateToken,
  getMyOffer
);

// Get price history, subject to buyer/seller authorization.
router.get(
  '/offers/:offerId/history',
  authenticateToken,
  getOfferHistory
);

const { selectOffer } = require('../controllers/dealController');

router.post(
  '/offers/:offerId/select',
  authenticateToken,
  selectOffer
);

module.exports = router;
