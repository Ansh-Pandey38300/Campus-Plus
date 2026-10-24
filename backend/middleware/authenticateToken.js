const db = require('../db');
const { verifyAccessToken } = require('../utils/tokenService');

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication token is required.'
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token is required.'
      });
    }

    const decoded = verifyAccessToken(token);
    const userId = Number(decoded.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(401).json({
        message: 'Invalid authentication token.'
      });
    }

    const [users] = await db.execute(
      `SELECT id, name, email, role, department_id
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'User account no longer exists.'
      });
    }

    req.user = users[0];

    next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        message: 'Invalid or expired authentication token.'
      });
    }

    console.error('Authentication error:', error.message);

    return res.status(500).json({
      message: 'Authentication failed because of a server error.'
    });
  }
}

module.exports = authenticateToken;