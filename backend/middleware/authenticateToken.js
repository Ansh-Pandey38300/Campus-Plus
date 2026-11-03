
const db = require('../db');

const { verifyAccessToken } = require('../utils/tokenService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const authenticateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(
      'Authentication token is required.',
      401
    );
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    throw new AppError(
      'Authentication token is required.',
      401
    );
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      throw new AppError(
        'Invalid or expired authentication token.',
        401
      );
    }

    throw error;
  }

  const userId = Number(decoded.sub);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new AppError(
      'Invalid authentication token.',
      401
    );
  }

  const [users] = await db.execute(
    `SELECT
     id,
     name,
     email,
     role,
     department_id,
     is_blocked,
     blocked_until
   FROM users
   WHERE id = ?
   LIMIT 1`,
    [userId]
  );

  if (users.length === 0) {
    throw new AppError(
      'User account no longer exists.',
      401
    );
  }

  const user = users[0];

  if (user.is_blocked) {
    const expired =
      user.blocked_until &&
      new Date(user.blocked_until) <= new Date();

    if (!expired) {
      throw new AppError(
        'Your account is temporarily blocked.',
        403
      );
    }

    await db.execute(
      `UPDATE users
     SET is_blocked = FALSE,
         blocked_until = NULL
     WHERE id = ?`,
      [user.id]
    );

    user.is_blocked = 0;
    user.blocked_until = null;
  }
// req.user = users;
  req.user = users[0];

  next();
});

module.exports = authenticateToken;
