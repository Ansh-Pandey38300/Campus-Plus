
const express = require('express');
const router = express.Router();

const db = require('../db');
const authenticateToken = require('../middleware/authenticateToken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// GET /api/requests/categories
// Return categories, including subcategories.
router.get(
  '/requests/categories',
  asyncHandler(async (req, res) => {
    const [categories] = await db.execute(
      `SELECT id, name, parent_id
       FROM categories
       ORDER BY name ASC`
    );

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  })
);

// GET /api/requests
// List requests with category and pickup-location names.
router.get(
  '/requests',
  asyncHandler(async (req, res) => {
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
       FROM requests AS r
       INNER JOIN categories AS c
         ON c.id = r.category_id
       INNER JOIN pickup_locations AS p
         ON p.id = r.pickup_location_id
       ORDER BY r.created_at DESC, r.id DESC`
    );

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  })
);

// POST /api/requests
// Create a request for the authenticated user.
router.post(
  '/requests',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      category_id,
      pickup_location_id,
      title,
      description,
      max_budget,
      deadline
    } = req.body;

    // Validate required fields.
    if (
      category_id === undefined ||
      category_id === null ||
      String(category_id).trim() === '' ||
      pickup_location_id === undefined ||
      pickup_location_id === null ||
      String(pickup_location_id).trim() === '' ||
      typeof title !== 'string' ||
      !title.trim() ||
      typeof description !== 'string' ||
      !description.trim() ||
      max_budget === undefined ||
      max_budget === null ||
      max_budget === '' ||
      deadline === undefined ||
      deadline === null ||
      deadline === ''
    ) {
      throw new AppError(
        'Category, pickup location, title, description, maximum budget and deadline are required.',
        400
      );
    }

    const categoryId = Number(category_id);
    const pickupLocationId = Number(pickup_location_id);
    const budget = Number(max_budget);

    if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
      throw new AppError('Invalid category ID.', 400);
    }

    if (
      !Number.isSafeInteger(pickupLocationId) ||
      pickupLocationId <= 0
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

    const titleValue = title.trim();
    const descriptionValue = description.trim();

    if (titleValue.length > 150) {
      throw new AppError(
        'Title must not exceed 150 characters.',
        400
      );
    }

    // Validate the deadline format and require a future date.
    // Accept MySQL DATETIME format or an ISO timestamp.
    if (
      typeof deadline !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z)?$/.test(deadline)
    ) {
      throw new AppError(
        'Deadline must be a valid datetime.',
        400
      );
    }

    const deadlineDate = new Date(deadline);

    if (
      Number.isNaN(deadlineDate.getTime()) ||
      deadlineDate.getTime() <= Date.now()
    ) {
      throw new AppError(
        'Deadline must be in the future.',
        400
      );
    }

    // Verify that the selected category exists.
    const [categories] = await db.execute(
      'SELECT id FROM categories WHERE id = ? LIMIT 1',
      [categoryId]
    );

    if (categories.length === 0) {
      throw new AppError(
        'Selected category does not exist.',
        400
      );
    }

    // Verify that the selected pickup location exists.
    const [locations] = await db.execute(
      'SELECT id FROM pickup_locations WHERE id = ? LIMIT 1',
      [pickupLocationId]
    );

    if (locations.length === 0) {
      throw new AppError(
        'Selected pickup location does not exist.',
        400
      );
    }

    // The authenticated user's ID comes from the database-backed
    // authentication middleware, never from req.body.
    const buyerId = req.user.id;

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
        pickupLocationId,
        titleValue,
        descriptionValue,
        budget,
        deadline.replace('T', ' ').replace(/Z$/, ''),
      ]
    );

    // Return the saved request with its category and location names.
    const [createdRequests] = await db.execute(
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
       FROM requests AS r
       INNER JOIN categories AS c
         ON c.id = r.category_id
       INNER JOIN pickup_locations AS p
         ON p.id = r.pickup_location_id
       WHERE r.id = ?
       LIMIT 1`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Request created successfully.',
      request: createdRequests[0]
    });
  })
);

module.exports = router;
