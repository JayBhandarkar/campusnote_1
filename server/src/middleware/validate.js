/**
 * middleware/validate.js — Request Validation Middleware
 *
 * Uses Zod schemas to validate incoming request data (req.body, req.query, req.params)
 * BEFORE route controllers execute. If validation fails, responds with 400 Bad Request
 * and specific field-level error messages.
 */
import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return next(new ApiError(400, 'Validation failed', formattedErrors));
    }
    return next(new ApiError(400, error.message));
  }
};
