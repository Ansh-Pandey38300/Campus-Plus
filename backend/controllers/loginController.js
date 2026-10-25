
const asyncHandler = require('../utils/asyncHandler');
const { loginUser } = require('../services/authService');

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(
    req.body?.email,
    req.body?.password
  );

  res.status(200).json({
    message: 'Login successful.',
    ...result
  });
});

module.exports = { login };
