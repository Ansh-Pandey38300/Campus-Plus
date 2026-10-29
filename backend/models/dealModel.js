const db = require('../db');

async function getDealById(dealId) {
  const [rows] = await db.execute(
    `SELECT id, request_id, offer_id, buyer_id, seller_id,
            agreed_amount, status, created_at, updated_at
     FROM deals
     WHERE id = ?
     LIMIT 1`,
    [dealId]
  );

  return rows[0] || null;
}

async function getTransactionsByDealId(dealId) {
  const [rows] = await db.execute(
    `SELECT id, deal_id, amount, payment_method, status,
            reference_code, created_at, updated_at
     FROM transactions
     WHERE deal_id = ?
     ORDER BY id ASC`,
    [dealId]
  );

  return rows;
}

async function getHandoverByDealId(dealId) {
  const [rows] = await db.execute(
    `SELECT id, deal_id, status, created_at, updated_at
     FROM handover_records
     WHERE deal_id = ?
     LIMIT 1`,
    [dealId]
  );

  return rows[0] || null;
}

module.exports = {
  getDealById,
  getTransactionsByDealId,
  getHandoverByDealId
};
