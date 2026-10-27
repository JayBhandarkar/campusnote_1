import { ApiError } from '../utils/ApiError.js';

export const requireActiveUser = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  if (!req.user.isActive) {
    return next(new ApiError(403, 'Account is deactivated. Action not permitted.'));
  }

  next();
};
