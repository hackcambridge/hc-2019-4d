import { ErrorWithStatus } from 'server/utils';

export const middleware = {
  notFound(_req, _res, next) {
    next(new ErrorWithStatus('Not Found', 404));
  },
  error(error: ErrorWithStatus, _req, res, _next) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || 'An error occurred',
    });
  },
};
