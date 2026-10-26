const AppError = require('../utils/AppError');
const requestModel = require('../models/requestModel');

// Get all categories.
async function getCategories() {
  return await requestModel.getCategories();
}

// Get all pickup locations.
async function getPickupLocations() {
  return await requestModel.getPickupLocations();
}

// Get all requests.
async function getRequests() {
  return await requestModel.getRequests();
}

// Validate and create a new request.
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

  // Validate category ID.
  if (
    !Number.isSafeInteger(categoryId) ||
    categoryId <= 0
  ) {
    throw new AppError('Invalid category ID.', 400);
  }

  // Validate pickup location ID.
  if (
    !Number.isSafeInteger(locationId) ||
    locationId <= 0
  ) {
    throw new AppError('Invalid pickup location ID.', 400);
  }

  // Validate maximum budget.
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

  // Validate title.
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

  // Validate description.
  if (
    typeof description !== 'string' ||
    !description.trim()
  ) {
    throw new AppError('Description is required.', 400);
  }

  // Validate deadline format.
  if (
    typeof deadline !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z)?$/.test(deadline)
  ) {
    throw new AppError('Invalid deadline format.', 400);
  }

  // Validate deadline value and ensure it is in the future.
  const deadlineDate = new Date(deadline);

  if (
    Number.isNaN(deadlineDate.getTime()) ||
    deadlineDate.getTime() <= Date.now()
  ) {
    throw new AppError('Deadline must be in the future.', 400);
  }

  // Check whether the category exists.
  const categoryExists = await requestModel.categoryExists(
    categoryId
  );

  if (!categoryExists) {
    throw new AppError(
      'Selected category does not exist.',
      400
    );
  }

  // Check whether the pickup location exists.
  const locationExists =
    await requestModel.pickupLocationExists(locationId);

  if (!locationExists) {
    throw new AppError(
      'Selected pickup location does not exist.',
      400
    );
  }

  // Insert the request through the model.
  const requestId = await requestModel.insertRequest({
    buyerId,
    categoryId,
    locationId,
    title: title.trim(),
    description: description.trim(),
    budget,
    deadline: deadline.replace('T', ' ').replace(/Z$/, '')
  });

  // Fetch and return the newly created request.
  const createdRequest = await requestModel.getRequestById(
    requestId
  );

  return createdRequest;
}

module.exports = {
  getCategories,
  getPickupLocations,
  getRequests,
  createRequest
};