const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');

const { getDealDetails } = require('../controllers/dealDetailsController');

const {
  markHandedOver,
  confirmHandover
} = require('../controllers/handoverController');

const { getMyDeals } = require('../controllers/myDealsController');

const {
  markPaymentCompleted,
  confirmPaymentReceived
} = require('../controllers/paymentController');

router.get('/deals/my', authenticateToken, getMyDeals);

router.post(
  '/deals/:id/payment-completed',
  authenticateToken,
  markPaymentCompleted
);

router.post(
  '/deals/:id/confirm-payment',
  authenticateToken,
  confirmPaymentReceived
);

router.get('/deals/:id', authenticateToken, getDealDetails);

router.post(
  '/deals/:id/handover',
  authenticateToken,
  markHandedOver
);

router.post(
  '/deals/:id/confirm-handover',
  authenticateToken,
  confirmHandover
);

module.exports = router;
