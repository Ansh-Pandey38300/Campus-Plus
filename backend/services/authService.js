
const bcrypt = require('bcryptjs');
const db = require('../db');

const AppError = require('../utils/AppError');
const { isCollegeEmail } = require('../utils/emailValidator');
const { createAccessToken } = require('../utils/tokenService');

async function loginUser(email, password) {
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    throw new AppError('Email and password are required.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const [users] = await db.execute(
    `SELECT id, name, email, password_hash, role, department_id
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [normalizedEmail]
  );

  if (users.length === 0) {
    throw new AppError('Invalid email or password.', 401);
  }

  const user = users[0];

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new AppError('Invalid email or password.', 401);
  }

  let token;

  try {
    token = createAccessToken(user.id);
  } catch (error) {
    console.error('Token configuration error:', error);

    throw new AppError(
      'Authentication is not configured correctly.',
      500
    );
  }

  return {
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
  };
}

async function registerUser(data) {
  const { name, email, password, department_id } = data || {};

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    throw new AppError(
      'Name, email, and password are required.',
      400
    );
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedName || normalizedName.length > 100) {
    throw new AppError(
      'Name must contain between 1 and 100 characters.',
      400
    );
  }

  if (normalizedEmail.length > 254) {
    throw new AppError('Email address is too long.', 400);
  }

  if (
    password.length < 8 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    throw new AppError(
      'Password must contain at least 8 characters and no more than 72 UTF-8 bytes.',
      400
    );
  }

  let collegeEmail;

  try {
    collegeEmail = isCollegeEmail(normalizedEmail);
  } catch (error) {
    console.error('Email configuration error:', error);

    throw new AppError(
      'College email validation is not configured.',
      500
    );
  }

  if (!collegeEmail) {
    throw new AppError(
      'Please use your official @jnu.ac.in email address.',
      400
    );
  }

  let normalizedDepartmentId = null;

  if (department_id !== undefined && department_id !== null) {
    normalizedDepartmentId = Number(department_id);

    if (
      !Number.isSafeInteger(normalizedDepartmentId) ||
      normalizedDepartmentId <= 0
    ) {
      throw new AppError(
        'department_id must be a positive integer.',
        400
      );
    }

    const [departments] = await db.execute(
      'SELECT id FROM departments WHERE id = ?',
      [normalizedDepartmentId]
    );

    if (departments.length === 0) {
      throw new AppError(
        'The selected department does not exist.',
        400
      );
    }
  }

  const [existingUsers] = await db.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  if (existingUsers.length > 0) {
    throw new AppError(
      'An account with this email already exists.',
      409
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let result;

  try {
    const [insertResult] = await db.execute(
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

    result = insertResult;
  } catch (error) {
    // The database's UNIQUE constraint is the final
    // protection against simultaneous duplicate registrations.
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'An account with this email already exists.',
        409
      );
    }

    throw error;
  }

  return {
    id: result.insertId,
    name: normalizedName,
    email: normalizedEmail,
    role: 'student',
    department_id: normalizedDepartmentId
  };
}

module.exports = {
  loginUser,
  registerUser
};
