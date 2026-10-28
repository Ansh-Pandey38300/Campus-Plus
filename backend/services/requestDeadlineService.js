
const db = require('../db');

/**
 * Close requests whose deadlines have passed.
 *
 * The requests.deadline column stores a DATETIME without timezone
 * information. This project treats those values as India local time
 * (IST, UTC+05:30).
 *
 * Using UTC_TIMESTAMP() + 330 minutes avoids depending on the
 * MySQL server's configured timezone.
 */
async function closeExpiredRequests() {
  const [result] = await db.execute(`
    UPDATE requests
    SET status = 'closed'
    WHERE status = 'open'
      AND deadline <= DATE_ADD(
        UTC_TIMESTAMP(),
        INTERVAL 330 MINUTE
      )
  `);

  return {
    closedCount: result.affectedRows
  };
}

module.exports = {
  closeExpiredRequests
};
