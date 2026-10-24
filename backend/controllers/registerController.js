const bcrypt = require('bcryptjs');
const db = require('../db');

const {
  isCollegeEmail
} = require('../utils/emailValidator');

async function register(req, res) {
  try {
    const { name, email, password, department_id } = req.body || {};

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        message: 'Name, email, and password are required.'
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || normalizedName.length > 100) {
      return res.status(400).json({
        message: 'Name must contain between 1 and 100 characters.'
      });
    }

    if (normalizedEmail.length > 254) {
      return res.status(400).json({
        message: 'Email address is too long.'
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters and no more than 72 UTF-8 bytes.'
      });
    }

    let collegeEmail;

    try {
      collegeEmail = isCollegeEmail(normalizedEmail);
    } catch (error) {
      console.error('Email configuration error:', error.message);

      return res.status(500).json({
        message: 'College email validation is not configured.'
      });
    }

    if (!collegeEmail) {
      return res.status(400).json({
        message: 'Please use your official @jnu.ac.in email address.'
      });
    }

    let normalizedDepartmentId = null;

    if (department_id !== undefined && department_id !== null) {
      normalizedDepartmentId = Number(department_id);

      if (
        !Number.isSafeInteger(normalizedDepartmentId) ||
        normalizedDepartmentId <= 0
      ) {
        return res.status(400).json({
          message: 'department_id must be a positive integer.'
        });
      }

      const [departments] = await db.execute(
        'SELECT id FROM departments WHERE id = ?',
        [normalizedDepartmentId]
      );

      if (departments.length === 0) {
        return res.status(400).json({
          message: 'The selected department does not exist.'
        });
      }
    }

    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      `INSERT INTO users
        (name, email, password_hash, role, department_id)
       VALUES (?, ?, ?, 'student', ?)`,
      [
        normalizedName,
        normalizedEmail,
        passwordHash,
        normalizedDepartmentId
      ]
    );

    return res.status(201).json({
      message: 'Registration successful.',
      user: {
        id: result.insertId,
        name: normalizedName,
        email: normalizedEmail,
        role: 'student',
        department_id: normalizedDepartmentId
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    console.error('Registration error:', error.message);

    return res.status(500).json({
      message: 'Registration failed because of a server error.'
    });
  }
}

module.exports = {
  register
};