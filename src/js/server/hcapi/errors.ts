import { ErrorWithStatus } from "../utils";

export function createError(status, message) {
  return new ErrorWithStatus(message, status);
};

export const middleware = {
  notFound(req, res, next) {
    next(exports.createHttpError(404, 'Not Found'));
  },
  error(error: ErrorWithStatus, req, res, next) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || 'An error occurred',
    });
  },
}
