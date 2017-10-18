exports.createHttpError = function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
};

exports.middleware = {
  notFound(req, res, next) {
    next(exports.createHttpError(404, 'Not Found'));
  },
  error(error, req, res, next) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || 'An error occurred',
    });
  },
};
