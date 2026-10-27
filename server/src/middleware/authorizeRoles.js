/**
 * middleware/authorizeRoles.js — Role-Based Access Control (RBAC)
 *
 * Higher-order middleware factory that checks if the authenticated user (`req.user`)
 * has one of the allowed roles (e.g. 'Admin', 'Faculty', 'Student').
 *
 * Example: `authorizeRoles('Admin')` blocks students and faculty with 403 Forbidden.
 */
import { ApiError } from '../utils/ApiError.js';

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource. Allowed: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};
