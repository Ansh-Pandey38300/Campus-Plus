const db = require('../db');

// Find a user by email for login.
async function findUserByEmail(email) {
  const [users] = await db.execute(
    `SELECT id, name, email, password_hash, role, department_id
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return users.length > 0 ? users[0] : null;
}

// Check whether a department exists.
async function departmentExists(departmentId) {
  const [departments] = await db.execute(
    'SELECT id FROM departments WHERE id = ?',
    [departmentId]
  );

  return departments.length > 0;
}

// Check whether a user with this email already exists.
async function findUserByEmailForRegistration(email) {
  const [users] = await db.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  return users.length > 0;
}

// Create a new user in the database.
async function createUser({
  name,
  email,
  passwordHash,
  departmentId
}) {
  const [result] = await db.execute(
    `INSERT INTO users
      (name, email, password_hash, role, department_id)
     VALUES (?, ?, ?, 'student', ?)`,
    [name, email, passwordHash, departmentId]
  );

  return result.insertId;
}

module.exports = {
  findUserByEmail,
  departmentExists,
  findUserByEmailForRegistration,
  createUser
};