const bcrypt = require('bcryptjs');
const db = require('../db');

const {
  createAccessToken
} = require('../utils/tokenService');

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await db.execute(
      `SELECT
        id,
        name,
        email,
        password_hash,
        role,
        department_id
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      });
    }

    let token;

    try {
      token = createAccessToken(user.id);
    } catch (error) {
      console.error('Token configuration error:', error.message);

      return res.status(500).json({
        message: 'Authentication is not configured correctly.'
      });
    }

    return res.status(200).json({
      message: 'Login successful.',
      token,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      message: 'Login failed because of a server error.'
    });
  }
}

module.exports = {
  login
};