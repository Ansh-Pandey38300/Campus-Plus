
const db = require('../db');
const AppError = require('../utils/AppError');

async function submitRating(dealIdValue, userId, starsValue, commentValue) {
  const dealId = Number(dealIdValue);
  const stars = Number(starsValue);

  if (!Number.isSafeInteger(dealId) || dealId <= 0) {
    throw new AppError('Invalid deal ID.', 400);
  }

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new AppError('Rating must be between 1 and 5 stars.', 400);
  }

  let comment = null;

  if (commentValue !== undefined && commentValue !== null) {
    if (typeof commentValue !== 'string') {
      throw new AppError('Comment must be text.', 400);
    }

    comment = commentValue.trim();

    if (comment.length > 1000) {
      throw new AppError('Comment cannot exceed 1000 characters.', 400);
    }

    if (comment === '') comment = null;
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [deals] = await connection.execute(
      `SELECT id, buyer_id, seller_id, status
       FROM deals
       WHERE id = ?
       FOR UPDATE`,
      [dealId]
    );

    const deal = deals[0];

    if (!deal) {
      throw new AppError('Deal not found.', 404);
    }

    if (Number(deal.buyer_id) !== Number(userId)) {
      throw new AppError('Only the buyer can rate the seller.', 403);
    }

    if (Number(deal.seller_id) === Number(userId)) {
      throw new AppError('You cannot rate yourself.', 403);
    }

    if (deal.status !== 'completed') {
      throw new AppError('Deal is not completed yet.', 409);
    }

    // Verify buyer-confirmed handover.
    const [handovers] = await connection.execute(
      `SELECT status
       FROM handover_records
       WHERE deal_id = ?
       LIMIT 1
       FOR UPDATE`,
      [dealId]
    );

    if (!handovers[0] || handovers[0].status !== 'confirmed') {
      throw new AppError(
        'Buyer must confirm handover before rating.',
        409
      );
    }

    await connection.execute(
      `INSERT INTO ratings
       (deal_id, rater_id, seller_id, stars, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [dealId, userId, deal.seller_id, stars, comment]
    );

    const [averageRows] = await connection.execute(
      `SELECT
         ROUND(AVG(stars), 2) AS average_rating,
         COUNT(*) AS total_ratings
       FROM ratings
       WHERE seller_id = ?`,
      [deal.seller_id]
    );

    await connection.commit();

    return {
      deal_id: dealId,
      seller_id: Number(deal.seller_id),
      stars,
      comment,
      average_rating: Number(averageRows[0].average_rating),
      total_ratings: Number(averageRows[0].total_ratings)
    };

  } catch (error) {
    await connection.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError('You have already rated this deal.', 409);
    }

    throw error;

  } finally {
    connection.release();
  }
}

async function getDealRating(dealIdValue, userId) {
  const dealId = Number(dealIdValue);

  if (!Number.isSafeInteger(dealId) || dealId <= 0) {
    throw new AppError('Invalid deal ID.', 400);
  }

  const [deals] = await db.execute(
    `SELECT id, buyer_id, seller_id
     FROM deals
     WHERE id = ?
     LIMIT 1`,
    [dealId]
  );

  const deal = deals[0];

  if (!deal) {
    throw new AppError('Deal not found.', 404);
  }

  if (
    Number(deal.buyer_id) !== Number(userId) &&
    Number(deal.seller_id) !== Number(userId)
  ) {
    throw new AppError('You cannot view this deal rating.', 403);
  }

  const [ratings] = await db.execute(
    `SELECT id, deal_id, rater_id, seller_id, stars, comment, created_at
     FROM ratings
     WHERE deal_id = ?
     LIMIT 1`,
    [dealId]
  );

  const [averages] = await db.execute(
    `SELECT
       ROUND(AVG(stars), 2) AS average_rating,
       COUNT(*) AS total_ratings
     FROM ratings
     WHERE seller_id = ?`,
    [deal.seller_id]
  );

  return {
    deal_id: dealId,
    rating: ratings[0] || null,
    average_rating: Number(averages[0].average_rating || 0),
    total_ratings: Number(averages[0].total_ratings)
  };
}


module.exports = {
  submitRating,
  getDealRating
};
