
const AppError = require('../utils/AppError');

function authorizeRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return next(
        new AppError('Authentication is required.', 401)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to access this resource.',
          403
        )
      );
    }

    next();
  };
}

module.exports = authorizeRole;
