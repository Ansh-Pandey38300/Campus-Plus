
const AppError = require('../utils/AppError');
const sellerItemModel = require('../models/sellerItemModel');

const ALLOWED_CONDITIONS = [
  'new',
  'like_new',
  'good',
  'fair',
  'poor'
];

async function createSellerItem(sellerId, data) {
  const {
    category_id,
    title,
    item_condition,
    asking_price,
    description
  } = data;

  const categoryId = Number(category_id);
  const askingPrice = Number(asking_price);

  if (
    !Number.isSafeInteger(categoryId) ||
    categoryId <= 0
  ) {
    throw new AppError('Please select a valid category.', 400);
  }

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    title.trim().length > 150
  ) {
    throw new AppError(
      'Item title is required and must not exceed 150 characters.',
      400
    );
  }

  if (
    typeof item_condition !== 'string' ||
    !ALLOWED_CONDITIONS.includes(item_condition)
  ) {
    throw new AppError(
      'Please select a valid item condition.',
      400
    );
  }

  if (
    !Number.isFinite(askingPrice) ||
    askingPrice <= 0 ||
    askingPrice > 99999999.99
  ) {
    throw new AppError(
      'Asking price must be greater than zero and within the allowed limit.',
      400
    );
  }

  if (
    typeof description !== 'string' ||
    !description.trim()
  ) {
    throw new AppError('Item description is required.', 400);
  }

  if (!(await sellerItemModel.categoryExists(categoryId))) {
    throw new AppError('Selected category does not exist.', 400);
  }

  const itemId = await sellerItemModel.insertSellerItem({
    sellerId,
    categoryId,
    title: title.trim(),
    itemCondition: item_condition,
    askingPrice,
    description: description.trim()
  });

  const items = await sellerItemModel.getSellerItems(sellerId);
  const createdItem = items.find(
    (item) => Number(item.id) === Number(itemId)
  );

  if (!createdItem) {
    throw new AppError(
      'Item was saved but could not be retrieved.',
      500
    );
  }

  return createdItem;
}

async function getMySellerItems(sellerId) {
  return sellerItemModel.getSellerItems(sellerId);
}

module.exports = {
  createSellerItem,
  getMySellerItems
};
