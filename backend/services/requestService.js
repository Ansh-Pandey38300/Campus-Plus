
const db = require('../db');
const AppError = require('../utils/AppError');

async function getCategories() {
  const [categories] = await db.execute(
    `SELECT id, name, parent_id
     FROM categories
     ORDER BY name ASC`
  );

  return categories;
}

async function getPickupLocations() {
  const [locations] = await db.execute(
    `SELECT id, name, description
     FROM pickup_locations
     ORDER BY name ASC`
  );

  return locations;
}

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



async function getRequestById(id) {
  const requestId = Number(id);

  if (!Number.isSafeInteger(requestId) || requestId <= 0) {
    throw new AppError('Invalid request ID.', 400);
  }

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

  if (requests.length === 0) {
    throw new AppError('Request not found.', 404);
  }

  return requests[0];
}




async function createRequest(buyerId, data) {
  const {
    category_id,
    pickup_location_id,
    title,
    description,
    max_budget,
    deadline
  } = data;

  const categoryId = Number(category_id);
  const locationId = Number(pickup_location_id);
  const budget = Number(max_budget);

  if (
    !Number.isSafeInteger(categoryId) ||
    categoryId <= 0
  ) {
    throw new AppError('Invalid category ID.', 400);
  }

  if (
    !Number.isSafeInteger(locationId) ||
    locationId <= 0
  ) {
    throw new AppError('Invalid pickup location ID.', 400);
  }

  if (!Number.isFinite(budget) || budget <= 0) {
    throw new AppError(
      'Maximum budget must be greater than zero.',
      400
    );
  }

  if (budget > 99999999.99) {
    throw new AppError(
      'Maximum budget exceeds the allowed limit.',
      400
    );
  }

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    title.trim().length > 150
  ) {
    throw new AppError(
      'Title is required and must not exceed 150 characters.',
      400
    );
  }

  if (
    typeof description !== 'string' ||
    !description.trim()
  ) {
    throw new AppError('Description is required.', 400);
  }

  if (
    typeof deadline !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z)?$/.test(deadline)
  ) {
    throw new AppError('Invalid deadline format.', 400);
  }

  const deadlineDate = new Date(deadline);

  if (
    Number.isNaN(deadlineDate.getTime()) ||
    deadlineDate.getTime() <= Date.now()
  ) {
    throw new AppError('Deadline must be in the future.', 400);
  }

  const [categories] = await db.execute(
    'SELECT id FROM categories WHERE id = ? LIMIT 1',
    [categoryId]
  );

  if (!categories.length) {
    throw new AppError(
      'Selected category does not exist.',
      400
    );
  }

  const [locations] = await db.execute(
    'SELECT id FROM pickup_locations WHERE id = ? LIMIT 1',
    [locationId]
  );

  if (!locations.length) {
    throw new AppError(
      'Selected pickup location does not exist.',
      400
    );
  }

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
      title.trim(),
      description.trim(),
      budget,
      deadline.replace('T', ' ').replace(/Z$/, '')
    ]
  );

  const [created] = await db.execute(
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
    [result.insertId]
  );

  return created[0];
}

module.exports = {
  getCategories,
  getPickupLocations,
  getRequests,
  getRequestById,
  createRequest
};
