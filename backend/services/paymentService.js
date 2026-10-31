
const db = require('../db');
const AppError = require('../utils/AppError');

async function markPaymentCompleted(dealIdValue, userId, paymentMethodValue) {
  const dealId = Number(dealIdValue);
  const paymentMethod = String(paymentMethodValue || '').toLowerCase();

  if (!Number.isSafeInteger(dealId) || dealId <= 0) {
    throw new AppError('Invalid deal ID.', 400);
  }

  if (!['cash', 'upi'].includes(paymentMethod)) {
    throw new AppError('Choose Cash or UPI as payment method.', 400);
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [deals] = await connection.execute(
      `SELECT id, buyer_id, status
       FROM deals
       WHERE id = ?
       LIMIT 1
       FOR UPDATE`,
      [dealId]
    );

    const deal = deals[0];

    if (!deal) throw new AppError('Deal not found.', 404);

    if (Number(deal.buyer_id) !== Number(userId)) {
      throw new AppError('Only the buyer can mark payment completed.', 403);
    }

    if (deal.status === 'completed') {
      throw new AppError('This deal is already completed.', 409);
    }

    const [transactions] = await connection.execute(
      `SELECT id, status
       FROM transactions
       WHERE deal_id = ?
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
      [dealId]
    );

    const transaction = transactions[0];

    if (!transaction) {
      throw new AppError('Transaction not found.', 404);
    }

    if (transaction.status !== 'pending') {
      throw new AppError('This transaction is not pending.', 409);
    }

    await connection.execute(
      `UPDATE transactions
       SET payment_method = ?, status = 'paid'
       WHERE id = ?`,
      [paymentMethod, transaction.id]
    );

    await connection.commit();

    return {
      deal_id: dealId,
      transaction_id: transaction.id,
      payment_method: paymentMethod,
      status: 'paid'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function confirmPaymentReceived(dealIdValue, userId) {
  const dealId = Number(dealIdValue);

  if (!Number.isSafeInteger(dealId) || dealId <= 0) {
    throw new AppError('Invalid deal ID.', 400);
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [deals] = await connection.execute(
      `SELECT id, seller_id, request_id, status
       FROM deals
       WHERE id = ?
       LIMIT 1
       FOR UPDATE`,
      [dealId]
    );

    const deal = deals[0];

    if (!deal) throw new AppError('Deal not found.', 404);

    if (Number(deal.seller_id) !== Number(userId)) {
      throw new AppError('Only the seller can confirm received payment.', 403);
    }

    if (deal.status === 'completed') {
      throw new AppError('This deal is already completed.', 409);
    }

    const [transactions] = await connection.execute(
      `SELECT id, status
       FROM transactions
       WHERE deal_id = ?
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
      [dealId]
    );

    if (!transactions[0] || transactions[0].status !== 'paid') {
      throw new AppError('Buyer must mark payment completed first.', 409);
    }
    const [handovers] = await connection.execute(
  `SELECT status
   FROM handover_records
   WHERE deal_id = ?
   LIMIT 1
   FOR UPDATE`,
  [dealId]
);

if (!handovers[0] || handovers[0].status !== 'confirmed') {
  throw new AppError('Handover must be confirmed first.', 409);
}

    // Seller confirmation completes the deal.
    await connection.execute(
      `UPDATE deals
       SET status = 'completed'
       WHERE id = ?`,
      [dealId]
    );

    // Close the request only after seller confirmation.
    await connection.execute(
      `UPDATE requests
       SET status = 'closed'
       WHERE id = ?`,
      [deal.request_id]
    );

    await connection.commit();

    return {
      deal_id: dealId,
      deal_status: 'completed',
      request_status: 'closed',
      transaction_status: 'paid',
      message: 'Payment confirmed. Deal completed and request closed.'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  markPaymentCompleted,
  confirmPaymentReceived
};
