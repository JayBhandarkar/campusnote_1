import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(404, message);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}: "${err.keyValue ? err.keyValue[field] : ''}". Please use another value.`;
    error = new ApiError(409, message, [{ field, message }]);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    error = new ApiError(400, 'Validation Error', errors);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token expired. Please log in again.');
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ApiError(413, `File is too large. Maximum allowed size is ${env.MAX_FILE_SIZE_MB}MB.`);
    } else {
      error = new ApiError(400, `File upload error: ${err.message}`);
    }
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errors = error.errors || [];

  const response = {
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
  };

  if (error.data) {
    response.data = error.data;
  }

  if (env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  if (statusCode === 500) {
    console.error(`[Server Error] ${err.message}`, err.stack);
  }

  return res.status(statusCode).json(response);
};
