const db = require('../db');
const AppError = require('../utils/AppError');

async function getComplaints() {
  const [rows] = await db.execute(`
    SELECT
      c.id,
      c.deal_id,
      c.reporter_id,
      c.reason,
      c.status,
      c.created_at,
      c.reviewed_at,
      reporter.name AS reporter_name,
      reporter.email AS reporter_email,
      d.buyer_id,
      d.seller_id,
      d.status AS deal_status,
      buyer.name AS buyer_name,
      seller.name AS seller_name
    FROM complaints c
    JOIN users reporter ON reporter.id = c.reporter_id
    JOIN deals d ON d.id = c.deal_id
    JOIN users buyer ON buyer.id = d.buyer_id
    JOIN users seller ON seller.id = d.seller_id
    ORDER BY c.created_at DESC
  `);

  return rows;
}

async function moderateComplaint({
  complaintId,
  adminId,
  userId,
  type,
  days
}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [complaints] = await connection.execute(
      `SELECT
         c.id,
         c.status,
         c.reviewed_by,
         d.buyer_id,
         d.seller_id
       FROM complaints c
       JOIN deals d ON d.id = c.deal_id
       WHERE c.id = ?
       FOR UPDATE`,
      [complaintId]
    );

    const complaint = complaints[0];

    if (!complaint) {
      throw new AppError('Complaint not found.', 404);
    }

    if (
      Number(userId) !== Number(complaint.buyer_id) &&
      Number(userId) !== Number(complaint.seller_id)
    ) {
      throw new AppError(
        'The selected user is not involved in this deal.',
        400
      );
    }

    if (Number(userId) === Number(adminId)) {
      throw new AppError(
        'You cannot issue a penalty against yourself.',
        400
      );
    }

    if (!['warning', 'temporary_block'].includes(type)) {
      throw new AppError('Invalid penalty type.', 400);
    }

    let untilDate = null;

    if (type === 'temporary_block') {
      const duration = Number(days);

      if (
        !Number.isInteger(duration) ||
        duration < 1 ||
        duration > 30
      ) {
        throw new AppError(
          'Block duration must be between 1 and 30 days.',
          400
        );
      }

      untilDate = new Date(
        Date.now() + duration * 24 * 60 * 60 * 1000
      );
    }

    const [users] = await connection.execute(
      `SELECT id, role
   FROM users
   WHERE id = ?
   FOR UPDATE`,
      [userId]
    );

    if (!users.length) {
      throw new AppError('User not found.', 404);
    }

    if (users[0].role === 'admin') {
      throw new AppError(
        'You cannot issue moderation penalties against an administrator.',
        403
      );
    }

    if (complaint.status === 'resolved') {
      throw new AppError(
        'This complaint has already been resolved.',
        400
      );
    }

    const [result] = await connection.execute(
      `INSERT INTO penalties
        (user_id, complaint_id, type, until_date)
       VALUES (?, ?, ?, ?)`,
      [userId, complaintId, type, untilDate]
    );

    if (type === 'temporary_block') {
      await connection.execute(
        `UPDATE users
         SET is_blocked = TRUE,
             blocked_until = ?
         WHERE id = ?`,
        [untilDate, userId]
      );
    }

    await connection.execute(
      `UPDATE complaints
       SET status = 'resolved',
           reviewed_by = ?,
           reviewed_at = NOW()
       WHERE id = ?`,
      [adminId, complaintId]
    );

    await connection.commit();

    return {
      id: result.insertId,
      complaint_id: Number(complaintId),
      user_id: Number(userId),
      type,
      until_date: untilDate
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getUsers(search = '') {
  const searchTerm = `%${search}%`;

  const [users] = await db.execute(
    `SELECT
       id,
       name,
       email,
       role,
       department_id,
       is_blocked,
       blocked_until,
       created_at
     FROM users
     WHERE name LIKE ?
        OR email LIKE ?
        OR CAST(id AS CHAR) LIKE ?
     ORDER BY created_at DESC
     LIMIT 100`,
    [searchTerm, searchTerm, searchTerm]
  );

  return users;
}

async function unblockUser({ userId, adminId }) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [users] = await connection.execute(
      `SELECT id, role, is_blocked
       FROM users
       WHERE id = ?
       FOR UPDATE`,
      [userId]
    );

    const user = users[0];

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // Administrators cannot be unblocked through student moderation.
    if (user.role === 'admin') {
      throw new AppError(
        'Administrator accounts cannot be modified through this action.',
        403
      );
    }

    if (!user.is_blocked) {
      throw new AppError(
        'This user is not currently blocked.',
        400
      );
    }

    await connection.execute(
      `UPDATE users
       SET is_blocked = FALSE,
           blocked_until = NULL
       WHERE id = ?`,
      [userId]
    );

    await connection.commit();

    return {
      user_id: Number(userId),
      is_blocked: false,
      blocked_until: null
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getComplaints,
  moderateComplaint,
  getUsers,
  unblockUser
};