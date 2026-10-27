
const db = require('../db');

async function categoryExists(categoryId) {
  const [rows] = await db.execute(
    `SELECT id
     FROM categories
     WHERE id = ?
     LIMIT 1`,
    [categoryId]
  );

  return rows.length > 0;
}

async function insertSellerItem({
  sellerId,
  categoryId,
  title,
  itemCondition,
  askingPrice,
  description
}) {
  const [result] = await db.execute(
    `INSERT INTO seller_items (
       seller_id,
       category_id,
       title,
       item_condition,
       asking_price,
       description
     )
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      sellerId,
      categoryId,
      title,
      itemCondition,
      askingPrice,
      description
    ]
  );

  return result.insertId;
}

async function getSellerItems(sellerId) {
  const [rows] = await db.execute(
    `SELECT
       si.id,
       si.seller_id,
       si.category_id,
       c.name AS category_name,
       si.title,
       si.item_condition,
       si.asking_price,
       si.description,
       si.status,
       si.created_at
     FROM seller_items si
     INNER JOIN categories c
       ON c.id = si.category_id
     WHERE si.seller_id = ?
     ORDER BY si.created_at DESC, si.id DESC`,
    [sellerId]
  );

  return rows;
}

module.exports = {
  categoryExists,
  insertSellerItem,
  getSellerItems
};
