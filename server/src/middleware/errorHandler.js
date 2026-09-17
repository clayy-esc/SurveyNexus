const errorHandler = (err, req, res, _next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `Duplicate value for "${field}"` });
  }

  const status = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
