const AppError = require('../utils/AppError');
const dealModel = require('../models/dealModel');

async function getDealDetails(dealIdValue, userIdValue) {
  const dealId = Number(dealIdValue);
  const userId = Number(userIdValue);

  if (!Number.isSafeInteger(dealId) || dealId <= 0) {
    throw new AppError('Invalid deal ID.', 400);
  }

  const deal = await dealModel.getDealById(dealId);

  if (!deal) {
    throw new AppError('Deal not found.', 404);
  }

  if (
    Number(deal.buyer_id) !== userId &&
    Number(deal.seller_id) !== userId
  ) {
    throw new AppError(
      'You are not authorized to view this deal.',
      403
    );
  }

  const [transactions, handover] = await Promise.all([
    dealModel.getTransactionsByDealId(dealId),
    dealModel.getHandoverByDealId(dealId)
  ]);

  return { deal, transactions, handover };
}

module.exports = { getDealDetails };
