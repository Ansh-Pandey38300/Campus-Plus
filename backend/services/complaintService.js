
const db = require('../db');
const AppError = require('../utils/AppError');

async function createComplaint(reference, reporterId, reasonValue) {
  const hasDealId = reference.deal_id !== undefined &&
    reference.deal_id !== null;
  const hasOfferId = reference.offer_id !== undefined &&
    reference.offer_id !== null;

  if (hasDealId === hasOfferId) {
    throw new AppError(
      'Provide either a deal ID or an offer ID.',
      400
    );
  }

  const referenceId = Number(
    hasDealId ? reference.deal_id : reference.offer_id
  );

  if (!Number.isSafeInteger(referenceId) || referenceId <= 0) {
    throw new AppError('Invalid deal or offer ID.', 400);
  }

  if (
    typeof reasonValue !== 'string' ||
    reasonValue.trim() === ''
  ) {
    throw new AppError('Complaint reason is required.', 400);
  }

  const reason = reasonValue.trim();

  if (reason.length > 5000) {
    throw new AppError(
      'Complaint reason cannot exceed 5000 characters.',
      400
    );
  }

  const column = hasDealId ? 'id' : 'offer_id';

  const [deals] = await db.execute(
    `SELECT id, buyer_id, seller_id
     FROM deals
     WHERE ${column} = ?
     LIMIT 1`,
    [referenceId]
  );

  const deal = deals[0];

  if (!deal) {
    throw new AppError(
      'No deal found for the provided ID.',
      404
    );
  }

  const isBuyer = Number(deal.buyer_id) === Number(reporterId);
  const isSeller = Number(deal.seller_id) === Number(reporterId);

  if (!isBuyer && !isSeller) {
    throw new AppError(
      'Only the buyer or seller involved in this deal can report it.',
      403
    );
  }

  const [result] = await db.execute(
    `INSERT INTO complaints (deal_id, reporter_id, reason)
     VALUES (?, ?, ?)`,
    [deal.id, reporterId, reason]
  );

  return {
    id: result.insertId,
    deal_id: deal.id,
    reporter_id: Number(reporterId),
    reason,
    status: 'open'
  };
}

async function getAllComplaints() {
  const [complaints] = await db.execute(
    `SELECT
       c.id,
       c.deal_id,
       c.reporter_id,
       c.reason,
       c.status,
       c.reviewed_by,
       c.created_at,
       c.reviewed_at,
       reporter.name AS reporter_name,
       reporter.email AS reporter_email,
       d.buyer_id,
       d.seller_id,
       d.status AS deal_status
     FROM complaints c
     INNER JOIN users reporter
       ON reporter.id = c.reporter_id
     INNER JOIN deals d
       ON d.id = c.deal_id
     ORDER BY c.created_at DESC`
  );

  return complaints;
}

module.exports = {
  createComplaint,
  getAllComplaints
};
