
const sellerItemService = require('../services/sellerItemService');

async function createSellerItem(req, res) {
  const item = await sellerItemService.createSellerItem(
    req.user.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: 'Seller item created successfully.',
    item
  });
}

async function getMySellerItems(req, res) {
  const items = await sellerItemService.getMySellerItems(
    req.user.id
  );

  res.status(200).json({
    success: true,
    count: items.length,
    items
  });
}

async function listSellerItems(req, res) {
  const items = await sellerItemService.listSellerItems(
    req.query.category
  );

  res.status(200).json({
    success: true,
    count: items.length,
    items
  });
}

module.exports = {
  createSellerItem,
  getMySellerItems,
  listSellerItems
};
