export class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '', data = null) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.data = data;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
