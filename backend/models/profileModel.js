
const db = require('../db');

// Get basic information of the logged-in user.
async function getUserProfile(userId) {
  const [rows] = await db.execute(
    `SELECT
       id,
       name,
       email,
       role,
       department_id
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

// Get all requests created by the logged-in user.
async function getMyRequests(userId) {
  const [rows] = await db.execute(
    `SELECT
       r.id,
       r.buyer_id,
       r.title,
       r.description,
       r.max_budget,
       r.deadline,
       r.status,
       r.created_at,
       c.name AS category_name,
       p.name AS pickup_location_name,
       (
         SELECT COUNT(*)
         FROM offers o
         WHERE o.request_id = r.id
       ) AS total_offers
     FROM requests r
     LEFT JOIN categories c
       ON c.id = r.category_id
     LEFT JOIN pickup_locations p
       ON p.id = r.pickup_location_id
     WHERE r.buyer_id = ?
     ORDER BY r.created_at DESC, r.id DESC`,
    [userId]
  );

  return rows;
}

// Get all offers submitted by the logged-in user.
async function getMyOffers(userId) {
  const [rows] = await db.execute(
    `SELECT
       o.id,
       o.request_id,
       o.seller_id,
       o.offered_price,
       o.offer_note,
       o.created_at,
       o.updated_at,
       r.title AS request_title,
       r.max_budget,
       r.status AS request_status,
       u.name AS buyer_name,
       d.id AS deal_id,
       d.status AS deal_status
     FROM offers o
     INNER JOIN requests r
       ON r.id = o.request_id
     INNER JOIN users u
       ON u.id = r.buyer_id
     LEFT JOIN deals d
       ON d.request_id = r.id
     WHERE o.seller_id = ?
     ORDER BY o.created_at DESC, o.id DESC`,
    [userId]
  );

  return rows;
}

// Get all ratings received by the user as a seller.
async function getMyRatings(userId) {
  const [rows] = await db.execute(
    `SELECT
       r.id,
       r.deal_id,
       r.rater_id,
       r.seller_id,
       r.stars,
       r.comment,
       r.created_at,
       u.name AS reviewer_name
     FROM ratings r
     INNER JOIN users u
       ON u.id = r.rater_id
     WHERE r.seller_id = ?
     ORDER BY r.created_at DESC, r.id DESC`,
    [userId]
  );

  return rows;
}

// Calculate average rating and total number of ratings.
async function getRatingSummary(userId) {
  const [rows] = await db.execute(
    `SELECT
       COALESCE(ROUND(AVG(stars), 2), 0)
         AS average_rating,
       COUNT(*) AS total_ratings
     FROM ratings
     WHERE seller_id = ?`,
    [userId]
  );

  return rows[0];
}

module.exports = {
  getUserProfile,
  getMyRequests,
  getMyOffers,
  getMyRatings,
  getRatingSummary
};
