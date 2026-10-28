
const requestService = require('../services/requestService');
const requestDeadlineService = require('../services/requestDeadlineService');

// Get all categories.
async function getCategories(req, res) {
  const categories = await requestService.getCategories();

  res.status(200).json({
    success: true,
    count: categories.length,
    categories
  });
}

// Get all pickup locations.
async function getPickupLocations(req, res) {
  const pickupLocations =
    await requestService.getPickupLocations();

  res.status(200).json({
    success: true,
    count: pickupLocations.length,
    pickupLocations
  });
}

// Close expired requests before returning the list.
async function getRequests(req, res) {
  await requestDeadlineService.closeExpiredRequests();

  const requests = await requestService.getRequests();

  res.status(200).json({
    success: true,
    count: requests.length,
    requests
  });
}

// Get one request by ID.
async function getRequestById(req, res) {
  const request = await requestService.getRequestById(
    req.params.id
  );

  res.status(200).json({
    success: true,
    request
  });
}

// Create a new request.
async function createRequest(req, res) {
  const request = await requestService.createRequest(
    req.user.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Request created successfully.',
    request
  });
}

module.exports = {
  getCategories,
  getPickupLocations,
  getRequests,
  getRequestById,
  createRequest
};
