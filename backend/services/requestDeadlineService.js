const db = require('../db');
const notificationService = require('./notificationService');

/**
 * Notify request owners one hour before their request closes.
 *
 * Only open requests with deadlines between now and
 * the next one hour are selected.
 *
 * Duplicate notifications are prevented using
 * reference_type and reference_id.
 */
async function notifyClosingSoonRequests() {
  const [requests] = await db.query(
    `SELECT
       r.id,
       r.buyer_id,
       r.title
     FROM requests r
     WHERE r.status = 'open'
       AND r.deadline > DATE_ADD(
         UTC_TIMESTAMP(),
         INTERVAL 330 MINUTE
       )
       AND r.deadline <= DATE_ADD(
         DATE_ADD(
           UTC_TIMESTAMP(),
           INTERVAL 330 MINUTE
         ),
         INTERVAL 1 HOUR
       )
       AND NOT EXISTS (
         SELECT 1
         FROM notifications n
         WHERE n.user_id = r.buyer_id
           AND n.type = 'deadline'
           AND n.reference_type = 'request_closing_soon'
           AND n.reference_id = r.id
       )`
  );

  let notifiedCount = 0;

  for (const request of requests) {
    await notificationService.createNotification({
      userId: request.buyer_id,
      type: 'deadline',
      message: `Your request "${request.title}" is closing within one hour. Check the offers before the deadline!`,
      referenceType: 'request_closing_soon',
      referenceId: request.id
    });

    notifiedCount++;
  }

  return notifiedCount;
}

/**
 * Close requests whose deadlines have passed.
 *
 * The project stores request deadlines in IST.
 */
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
  closeExpiredRequests,
  notifyClosingSoonRequests
};