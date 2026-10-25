
const asyncHandler = require('../utils/asyncHandler');
const { registerUser } = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    message: 'Registration successful.',
    user
  });
});

module.exports = { register };
