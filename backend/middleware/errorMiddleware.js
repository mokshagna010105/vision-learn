const Log = require('../models/Log');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = async (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  console.error(`[Error] ${err.message}\nStack: ${err.stack}`);

  // Async logging to database
  try {
    await Log.create({
      level: 'error',
      message: `${req.method} ${req.originalUrl} - ${err.message}`,
      apiEndpoint: req.originalUrl
    });
  } catch (logError) {
    console.error('Failed to save log to MongoDB:', logError.message);
  }

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };
