
const db = require('../db');

async function closeExpiredRequests() {
  const [result] = await db.query(
    `UPDATE requests
     SET status = 'closed'
     WHERE status = 'open'
       AND deadline IS NOT NULL
       AND deadline <= DATE_ADD(
         UTC_TIMESTAMP(),
         INTERVAL 330 MINUTE
       )`
  );

  return {
    closedCount: result.affectedRows
  };
}

module.exports = {
  closeExpiredRequests
};
