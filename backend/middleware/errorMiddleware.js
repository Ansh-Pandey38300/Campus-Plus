
const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Express/body-parser can attach `status` rather than `statusCode`.
  const parserStatus =
    err.status === 400 && err.type === 'entity.parse.failed'
      ? 400
      : null;

  const candidateStatus =
    err.statusCode || parserStatus || err.status;

  const statusCode =
    Number.isInteger(candidateStatus) &&
    candidateStatus >= 400 &&
    candidateStatus <= 599
      ? candidateStatus
      : 500;

  const isOperational = err.isOperational === true;

  if (!isOperational) {
    console.error('Unexpected application error:', err);
  }

  let message;

  if (parserStatus === 400) {
    message = 'Invalid JSON request body.';
  } else if (isOperational) {
    message = err.message;
  } else {
    message = 'Something went wrong.';
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message
  });
};

module.exports = errorMiddleware;
