import ErrorWithStatus from 'js/server/error-with-status';

export function createError(status, message) {
  return new ErrorWithStatus(message, status);
};

export const middleware = {
  notFound(req, res, next) {
    next(createError(404, 'Not Found'));
  },
  error(error, req, res, next) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || 'An error occurred',
    });
  },
};
