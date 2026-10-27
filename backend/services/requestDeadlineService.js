
const db = require('../db');

async function closeExpiredRequests() {
  const [result] = await db.query(
    `UPDATE requests
     SET status = 'closed'
     WHERE status = 'open'
       AND deadline IS NOT NULL
       AND deadline <= NOW()`
  );

  return {
    closedCount: result.affectedRows
  };
}

module.exports = {
  closeExpiredRequests
};
