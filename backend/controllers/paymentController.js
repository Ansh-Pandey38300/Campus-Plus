const asyncHandler = require('../utils/asyncHandler');
const paymentService = require('../services/paymentService');

const markPaymentCompleted = asyncHandler(async (req, res) => {
  const result = await paymentService.markPaymentCompleted(
    req.params.id,
    req.user.id,
    req.body.payment_method
  );

  res.status(200).json({
    message: 'Payment marked as completed.',
    transaction: result
  });
});

const confirmPaymentReceived = asyncHandler(async (req, res) => {
  const result = await paymentService.confirmPaymentReceived(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    message: 'Payment received and deal completed.',
    result
  });
});

module.exports = {
  markPaymentCompleted,
  confirmPaymentReceived
};