const bcrypt = require('bcryptjs');

const AppError = require('../utils/AppError');
const { isCollegeEmail } = require('../utils/emailValidator');
const { createAccessToken } = require('../utils/tokenService');

const authModel = require('../models/authModel');

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

  // Retrieve the user through the model.
  const user = await authModel.findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Password verification remains in the service.
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

  // Validate the college email address.
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

  // Validate the optional department ID.
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

    const exists = await authModel.departmentExists(
      normalizedDepartmentId
    );

    if (!exists) {
      throw new AppError(
        'The selected department does not exist.',
        400
      );
    }
  }

  // Check whether the email is already registered.
  const existingUser =
    await authModel.findUserByEmailForRegistration(
      normalizedEmail
    );

  if (existingUser) {
    throw new AppError(
      'An account with this email already exists.',
      409
    );
  }

  // Password hashing remains in the service.
  const passwordHash = await bcrypt.hash(password, 12);

  let userId;

  try {
    userId = await authModel.createUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      departmentId: normalizedDepartmentId
    });
  } catch (error) {
    // Preserve protection against simultaneous duplicate registrations.
    if (error.code === 'ER_DUP_ENTRY') {
      throw new AppError(
        'An account with this email already exists.',
        409
      );
    }

    throw error;
  }

  return {
    id: userId,
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