
const requestService = require('../services/requestService');

async function getCategories(req, res) {
  const categories = await requestService.getCategories();

  res.status(200).json({
    success: true,
    count: categories.length,
    categories
  });
}



async function getPickupLocations(req, res) {
  const pickupLocations =
    await requestService.getPickupLocations();

  res.status(200).json({
    success: true,
    count: pickupLocations.length,
    pickupLocations
  });
}



async function getRequests(req, res) {
  const requests = await requestService.getRequests();

  res.status(200).json({
    success: true,
    count: requests.length,
    requests
  });
}

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
  createRequest
};
