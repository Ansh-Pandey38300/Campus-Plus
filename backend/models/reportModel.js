const db = require('../db');

// 1. Requests that have not received any offers.
async function getRequestsWithoutOffers() {
  const [rows] = await db.execute(`
    SELECT
      r.id,
      r.title,
      r.max_budget,
      r.status,
      r.created_at
    FROM requests r
    WHERE NOT EXISTS (
      SELECT 1
      FROM offers o
      WHERE o.request_id = r.id
    )
    ORDER BY r.created_at DESC
  `);

  return rows;
}

// 2. Categories ranked by number of requests.
async function getTopCategories() {
  const [rows] = await db.execute(`
    SELECT
      c.id,
      c.name AS category,
      COUNT(r.id) AS total_requests
    FROM categories c
    LEFT JOIN requests r ON r.category_id = c.id
    GROUP BY c.id, c.name
    ORDER BY total_requests DESC
  `);

  return rows;
}

// 3. Sellers ranked by completed deals.
async function getTopSellers() {
  const [rows] = await db.execute(`
    SELECT
      u.id,
      u.name,
      COUNT(d.id) AS completed_deals
    FROM users u
    JOIN deals d ON d.seller_id = u.id
    WHERE d.status = 'completed'
    GROUP BY u.id, u.name
    ORDER BY completed_deals DESC
  `);

  return rows;
}

// 4. Savings calculated from completed deals.
async function getBuyerSavings() {
  const [rows] = await db.execute(`
    SELECT
      r.id AS request_id,
      r.title,
      r.max_budget,
      d.agreed_amount,
      (r.max_budget - d.agreed_amount) AS savings
    FROM deals d
    JOIN requests r ON r.id = d.request_id
    WHERE d.status = 'completed'
    ORDER BY savings DESC
  `);

  return rows;
}

module.exports = {
  getRequestsWithoutOffers,
  getTopCategories,
  getTopSellers,
  getBuyerSavings
};