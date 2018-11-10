import { ErrorWithStatus } from "../utils";

export const middleware = {
  notFound(req, res, next) {
    next(new ErrorWithStatus('Not Found', 404));
  },
  error(error: ErrorWithStatus, req, res, next) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || 'An error occurred',
    });
  },
}
