export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(_req, res, _next) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    console.error(`[AppError ${err.statusCode}]`, err.message);
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
}


