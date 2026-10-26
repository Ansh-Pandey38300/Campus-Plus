const db = require('../db');

// Fetch all categories.
async function getCategories() {
  const [categories] = await db.execute(
    `SELECT id, name, parent_id
     FROM categories
     ORDER BY name ASC`
  );

  return categories;
}

// Fetch all pickup locations.
async function getPickupLocations() {
  const [locations] = await db.execute(
    `SELECT id, name, description
     FROM pickup_locations
     ORDER BY name ASC`
  );

  return locations;
}

// Fetch all requests.
async function getRequests() {
  const [requests] = await db.execute(
    `SELECT
       r.id,
       r.buyer_id,
       r.category_id,
       c.name AS category_name,
       c.parent_id AS category_parent_id,
       r.pickup_location_id,
       p.name AS pickup_location_name,
       r.title,
       r.description,
       r.max_budget,
       r.deadline,
       r.status,
       r.created_at
     FROM requests r
     INNER JOIN categories c ON c.id = r.category_id
     INNER JOIN pickup_locations p
       ON p.id = r.pickup_location_id
     ORDER BY r.created_at DESC, r.id DESC`
  );

  return requests;
}

// Fetch a request by ID.
async function getRequestById(requestId) {
  const [requests] = await db.execute(
    `SELECT
       r.id,
       r.buyer_id,
       r.category_id,
       c.name AS category_name,
       c.parent_id AS category_parent_id,
       r.pickup_location_id,
       p.name AS pickup_location_name,
       r.title,
       r.description,
       r.max_budget,
       r.deadline,
       r.status,
       r.created_at
     FROM requests r
     INNER JOIN categories c ON c.id = r.category_id
     INNER JOIN pickup_locations p
       ON p.id = r.pickup_location_id
     WHERE r.id = ?
     LIMIT 1`,
    [requestId]
  );

  return requests[0] || null;
}

// Fetch a newly created request.
// Preserve the original createRequest response fields.
async function getCreatedRequestById(requestId) {
  const [requests] = await db.execute(
    `SELECT
       r.id,
       r.buyer_id,
       r.category_id,
       c.name AS category_name,
       r.pickup_location_id,
       p.name AS pickup_location_name,
       r.title,
       r.description,
       r.max_budget,
       r.deadline,
       r.status,
       r.created_at
     FROM requests r
     INNER JOIN categories c ON c.id = r.category_id
     INNER JOIN pickup_locations p
       ON p.id = r.pickup_location_id
     WHERE r.id = ?
     LIMIT 1`,
    [requestId]
  );

  return requests[0] || null;
}

// Check whether a category exists.
async function categoryExists(categoryId) {
  const [categories] = await db.execute(
    `SELECT id
     FROM categories
     WHERE id = ?
     LIMIT 1`,
    [categoryId]
  );

  return categories.length > 0;
}

// Check whether a pickup location exists.
async function pickupLocationExists(locationId) {
  const [locations] = await db.execute(
    `SELECT id
     FROM pickup_locations
     WHERE id = ?
     LIMIT 1`,
    [locationId]
  );

  return locations.length > 0;
}

// Insert a new request.
async function insertRequest({
  buyerId,
  categoryId,
  locationId,
  title,
  description,
  budget,
  deadline
}) {
  const [result] = await db.execute(
    `INSERT INTO requests (
       buyer_id,
       category_id,
       pickup_location_id,
       title,
       description,
       max_budget,
       deadline
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      buyerId,
      categoryId,
      locationId,
      title,
      description,
      budget,
      deadline
    ]
  );

  return result.insertId;
}

module.exports = {
  getCategories,
  getPickupLocations,
  getRequests,
  getRequestById,
  getCreatedRequestById,
  categoryExists,
  pickupLocationExists,
  insertRequest
};