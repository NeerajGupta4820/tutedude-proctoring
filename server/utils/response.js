/**
 * Standard API response format
 */
export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

/**
 * Standard API error format
 */
export class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Paginated response
 */
export class PaginatedResponse extends ApiResponse {
  constructor(statusCode, data, pagination, message = 'Success') {
    super(statusCode, data, message);
    this.pagination = pagination;
  }
}