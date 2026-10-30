const db = require('../db');

async function getMyDeals(userId) {
  const [rows] = await db.execute(
    `SELECT
       d.id,
       d.request_id,
       d.offer_id,
       d.buyer_id,
       d.seller_id,
       d.agreed_amount,
       d.status,
       d.created_at,
       r.title AS request_title,
       h.status AS handover_status
     FROM deals d
     INNER JOIN requests r ON r.id = d.request_id
     LEFT JOIN handover_records h ON h.deal_id = d.id
     WHERE d.seller_id = ? OR d.buyer_id = ?
     ORDER BY d.created_at DESC`,
    [userId, userId]
  );

  return rows;
}

module.exports = { getMyDeals };