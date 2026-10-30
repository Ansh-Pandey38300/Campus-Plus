
const db = require('../db');
const AppError = require('../utils/AppError');

function parsePositiveId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError('Invalid deal ID.', 400);
  }

  return id;
}

async function getAuthorizedDeal(connection, dealId, userId) {
  const [rows] = await connection.execute(
    `SELECT id, buyer_id, seller_id, request_id, status
     FROM deals
     WHERE id = ?
     LIMIT 1
     FOR UPDATE`,
    [dealId]
  );

  const deal = rows[0];

  if (!deal) {
    throw new AppError('Deal not found.', 404);
  }

  if (
    Number(deal.buyer_id) !== Number(userId) &&
    Number(deal.seller_id) !== Number(userId)
  ) {
    throw new AppError('You are not authorized to access this deal.', 403);
  }

  if (deal.status === 'completed') {
    throw new AppError('This deal is already completed.', 409);
  }

  return deal;
}

async function markHandedOver(dealIdValue, userId) {
  const dealId = parsePositiveId(dealIdValue);
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const deal = await getAuthorizedDeal(connection, dealId, userId);

    if (Number(deal.seller_id) !== Number(userId)) {
      throw new AppError('Only the seller can mark the item as handed over.', 403);
    }

    const [handovers] = await connection.execute(
      `SELECT id, status
       FROM handover_records
       WHERE deal_id = ?
       LIMIT 1
       FOR UPDATE`,
      [dealId]
    );

    let handover = handovers[0];

    if (!handover) {
      const [result] = await connection.execute(
        `INSERT INTO handover_records (deal_id, status)
         VALUES (?, 'agreed')`,
        [dealId]
      );

      handover = {
        id: result.insertId,
        status: 'agreed'
      };
    }

    if (handover.status !== 'agreed') {
      throw new AppError('Handover has already been marked.', 409);
    }

    await connection.execute(
      `UPDATE handover_records
       SET status = 'handed_over'
       WHERE id = ?`,
      [handover.id]
    );

    await connection.commit();

    return {
      deal_id: dealId,
      handover_status: 'handed_over'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function confirmHandover(dealIdValue, userId) {
  const dealId = parsePositiveId(dealIdValue);
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const deal = await getAuthorizedDeal(connection, dealId, userId);

    if (Number(deal.buyer_id) !== Number(userId)) {
      throw new AppError('Only the buyer can confirm the handover.', 403);
    }

    const [handovers] = await connection.execute(
      `SELECT id, status
       FROM handover_records
       WHERE deal_id = ?
       LIMIT 1
       FOR UPDATE`,
      [dealId]
    );

    const handover = handovers[0];

    if (!handover || handover.status !== 'handed_over') {
      throw new AppError('Seller must mark the item as handed over first.', 409);
    }

    await connection.execute(
      `UPDATE handover_records
       SET status = 'confirmed'
       WHERE id = ?`,
      [handover.id]
    );

    await connection.commit();

    return {
      deal_id: dealId,
      handover_status: 'confirmed'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  markHandedOver,
  confirmHandover
};
