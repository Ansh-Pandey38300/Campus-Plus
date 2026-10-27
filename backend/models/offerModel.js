
const db = require('../db');

// Get a request and lock it so concurrent offers for the same
// request are processed one at a time inside a transaction.
async function getRequestForUpdate(connection, requestId) {
  const [rows] = await connection.execute(
    `SELECT
       id,
       buyer_id,
       max_budget,
       status,
       deadline
     FROM requests
     WHERE id = ?
     LIMIT 1
     FOR UPDATE`,
    [requestId]
  );

  return rows[0] || null;
}

// Get the seller's existing offer, if any.
async function getSellerOfferForUpdate(
  connection,
  requestId,
  sellerId
) {
  const [rows] = await connection.execute(
    `SELECT
       id,
       request_id,
       seller_id,
       offered_price,
       offer_note,
       created_at,
       updated_at
     FROM offers
     WHERE request_id = ?
       AND seller_id = ?
     LIMIT 1
     FOR UPDATE`,
    [requestId, sellerId]
  );

  return rows[0] || null;
}

// Find the lowest offer made by a different seller.
async function getLowestCompetingOffer(
  connection,
  requestId,
  sellerId
) {
  const [rows] = await connection.execute(
    `SELECT MIN(offered_price) AS lowest_price
     FROM offers
     WHERE request_id = ?
       AND seller_id <> ?`,
    [requestId, sellerId]
  );

  return rows[0]?.lowest_price ?? null;
}

// Insert a new offer.
async function insertOffer(
  connection,
  {
    requestId,
    sellerId,
    offeredPrice,
    offerNote
  }
) {
  const [result] = await connection.execute(
    `INSERT INTO offers (
       request_id,
       seller_id,
       offered_price,
       offer_note
     )
     VALUES (?, ?, ?, ?)`,
    [
      requestId,
      sellerId,
      offeredPrice,
      offerNote
    ]
  );

  return result.insertId;
}

// Update an existing offer during a valid price revision.
async function updateOffer(
  connection,
  {
    offerId,
    offeredPrice,
    offerNote
  }
) {
  await connection.execute(
    `UPDATE offers
     SET offered_price = ?,
         offer_note = ?
     WHERE id = ?`,
    [
      offeredPrice,
      offerNote,
      offerId
    ]
  );
}

// Append a history row. Never overwrite previous history.
async function insertOfferHistory(
  connection,
  {
    offerId,
    previousPrice,
    newPrice,
    changedByUserId
  }
) {
  await connection.execute(
    `INSERT INTO offer_history (
       offer_id,
       previous_price,
       new_price,
       changed_by_user_id
     )
     VALUES (?, ?, ?, ?)`,
    [
      offerId,
      previousPrice,
      newPrice,
      changedByUserId
    ]
  );
}

// Retrieve one offer by ID.
async function getOfferById(offerId) {
  const [rows] = await db.execute(
    `SELECT
       o.id,
       o.request_id,
       o.seller_id,
       o.offered_price,
       o.offer_note,
       o.created_at,
       o.updated_at,
       u.name AS seller_name
     FROM offers o
     INNER JOIN users u ON u.id = o.seller_id
     WHERE o.id = ?
     LIMIT 1`,
    [offerId]
  );

  return rows[0] || null;
}

// Retrieve all offers for a request.
async function getOffersForRequest(requestId) {
  const [rows] = await db.execute(
    `SELECT
       o.id,
       o.request_id,
       o.seller_id,
       u.name AS seller_name,
       o.offered_price,
       o.offer_note,
       o.created_at,
       o.updated_at
     FROM offers o
     INNER JOIN users u ON u.id = o.seller_id
     WHERE o.request_id = ?
     ORDER BY o.offered_price ASC, o.created_at ASC, o.id ASC`,
    [requestId]
  );

  return rows;
}

// Retrieve the authenticated seller's offer for a request.
async function getSellerOffer(requestId, sellerId) {
  const [rows] = await db.execute(
    `SELECT
       id,
       request_id,
       seller_id,
       offered_price,
       offer_note,
       created_at,
       updated_at
     FROM offers
     WHERE request_id = ?
       AND seller_id = ?
     LIMIT 1`,
    [requestId, sellerId]
  );

  return rows[0] || null;
}

// Retrieve chronological offer price history.
async function getOfferHistory(offerId) {
  const [rows] = await db.execute(
    `SELECT
       id,
       offer_id,
       previous_price,
       new_price,
       changed_by_user_id,
       created_at
     FROM offer_history
     WHERE offer_id = ?
     ORDER BY created_at ASC, id ASC`,
    [offerId]
  );

  return rows;
}

// Get request ownership and offer details for authorization.
async function getOfferAccessDetails(offerId) {
  const [rows] = await db.execute(
    `SELECT
       o.id AS offer_id,
       o.request_id,
       o.seller_id,
       r.buyer_id
     FROM offers o
     INNER JOIN requests r ON r.id = o.request_id
     WHERE o.id = ?
     LIMIT 1`,
    [offerId]
  );

  return rows[0] || null;
}

// Run offer changes and history insertion atomically.
async function withTransaction(work) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const result = await work(connection);

    await connection.commit();

    return result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('Offer transaction rollback failed:', rollbackError);
    }

    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getRequestForUpdate,
  getSellerOfferForUpdate,
  getLowestCompetingOffer,
  insertOffer,
  updateOffer,
  insertOfferHistory,
  getOfferById,
  getOffersForRequest,
  getSellerOffer,
  getOfferHistory,
  getOfferAccessDetails,
  withTransaction
};
