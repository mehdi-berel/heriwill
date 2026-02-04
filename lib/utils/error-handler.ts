/**
 * Error Sanitization Utility
 * 
 * Sanitizes error messages to prevent exposing sensitive information
 * in production environments. Returns user-friendly error messages
 * while logging detailed errors for debugging.
 */

import { logger } from './logger'

/**
 * Generic error messages for different error types
 */
export const ErrorMessages = {
  // Authentication errors
  AUTH_FAILED: 'Authentication failed. Please log in again.',
  AUTH_REQUIRED: 'Authentication required. Please log in.',
  AUTH_INVALID: 'Invalid authentication credentials.',
  
  // Authorization errors
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  RESOURCE_FORBIDDEN: 'Access to this resource is forbidden.',
  
  // Database errors
  DATABASE_ERROR: 'A database error occurred. Please try again.',
  QUERY_FAILED: 'Failed to retrieve data. Please try again.',
  UPDATE_FAILED: 'Failed to update data. Please try again.',
  DELETE_FAILED: 'Failed to delete data. Please try again.',
  CREATE_FAILED: 'Failed to create resource. Please try again.',
  
  // Validation errors
  VALIDATION_ERROR: 'Invalid input. Please check your data and try again.',
  MISSING_REQUIRED: 'Required fields are missing.',
  INVALID_FORMAT: 'Invalid data format.',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  
  // Server errors
  INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  
  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
}

/**
 * Error types for categorization
 */
export enum ErrorType {
  AUTH = 'auth',
  PERMISSION = 'permission',
  DATABASE = 'database',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  NOT_FOUND = 'not_found',
  INTERNAL = 'internal',
  UNKNOWN = 'unknown',
}

/**
 * Sanitized error response
 */
export interface SanitizedError {
  message: string
  type: ErrorType
  statusCode: number
}

/**
 * Detect error type from error message or code
 */
function detectErrorType(error: Error | unknown): ErrorType {
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  
  // Authentication errors
  if (errorMessage.includes('auth') || 
      errorMessage.includes('token') || 
      errorMessage.includes('session') ||
      errorMessage.includes('not authenticated')) {
    return ErrorType.AUTH
  }
  
  // Permission errors
  if (errorMessage.includes('permission') || 
      errorMessage.includes('forbidden') || 
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('not allowed')) {
    return ErrorType.PERMISSION
  }
  
  // Database errors
  if (errorMessage.includes('database') || 
      errorMessage.includes('query') || 
      errorMessage.includes('postgres') ||
      errorMessage.includes('supabase') ||
      errorMessage.includes('relation') ||
      errorMessage.includes('constraint') ||
      errorMessage.includes('foreign key')) {
    return ErrorType.DATABASE
  }
  
  // Validation errors
  if (errorMessage.includes('invalid') || 
      errorMessage.includes('validation') || 
      errorMessage.includes('required') ||
      errorMessage.includes('format')) {
    return ErrorType.VALIDATION
  }
  
  // Rate limit errors
  if (errorMessage.includes('rate limit') || 
      errorMessage.includes('too many')) {
    return ErrorType.RATE_LIMIT
  }
  
  // Not found errors
  if (errorMessage.includes('not found') || 
      errorMessage.includes('does not exist')) {
    return ErrorType.NOT_FOUND
  }
  
  return ErrorType.UNKNOWN
}

/**
 * Get appropriate status code for error type
 */
function getStatusCode(type: ErrorType): number {
  switch (type) {
    case ErrorType.AUTH:
      return 401
    case ErrorType.PERMISSION:
      return 403
    case ErrorType.NOT_FOUND:
      return 404
    case ErrorType.VALIDATION:
      return 400
    case ErrorType.RATE_LIMIT:
      return 429
    case ErrorType.DATABASE:
    case ErrorType.INTERNAL:
      return 500
    default:
      return 500
  }
}

/**
 * Get user-friendly message for error type
 */
function getUserMessage(type: ErrorType): string {
  switch (type) {
    case ErrorType.AUTH:
      return ErrorMessages.AUTH_FAILED
    case ErrorType.PERMISSION:
      return ErrorMessages.PERMISSION_DENIED
    case ErrorType.NOT_FOUND:
      return ErrorMessages.RESOURCE_NOT_FOUND
    case ErrorType.VALIDATION:
      return ErrorMessages.VALIDATION_ERROR
    case ErrorType.RATE_LIMIT:
      return ErrorMessages.RATE_LIMIT_EXCEEDED
    case ErrorType.DATABASE:
      return ErrorMessages.DATABASE_ERROR
    case ErrorType.INTERNAL:
      return ErrorMessages.INTERNAL_ERROR
    default:
      return ErrorMessages.UNKNOWN_ERROR
  }
}

/**
 * Sanitize error for production use
 * Logs detailed error internally and returns safe message to client
 */
export function sanitizeError(
  error: Error | unknown,
  context?: Record<string, unknown>
): SanitizedError {
  // Log full error details for debugging
  logger.error('Error occurred', error, context)
  
  // Detect error type
  const type = detectErrorType(error)
  
  // Get appropriate status code and message
  const statusCode = getStatusCode(type)
  const message = getUserMessage(type)
  
  return {
    message,
    type,
    statusCode,
  }
}

/**
 * Sanitize error specifically for API responses
 * Returns object ready for NextResponse.json()
 */
export function sanitizeApiError(
  error: Error | unknown,
  context?: Record<string, unknown>
): { error: string; type: string; statusCode: number } {
  const sanitized = sanitizeError(error, context)
  
  return {
    error: sanitized.message,
    type: sanitized.type,
    statusCode: sanitized.statusCode,
  }
}

/**
 * Sanitize error for server actions
 * Throws a new error with sanitized message
 */
export function sanitizeActionError(
  error: Error | unknown,
  context?: Record<string, unknown>
): never {
  const sanitized = sanitizeError(error, context)
  throw new Error(sanitized.message)
}

/**
 * Check if error is safe to expose (for development)
 */
export function isSafeError(error: Error | unknown): boolean {
  if (!(error instanceof Error)) return false
  
  const safePatterns = [
    'not found',
    'already exists',
    'invalid input',
    'required',
    'too many',
  ]
  
  const message = error.message.toLowerCase()
  return safePatterns.some(pattern => message.includes(pattern))
}

/**
 * Get error message (sanitized in production, detailed in development)
 */
export function getErrorMessage(error: Error | unknown): string {
  // In development, show detailed errors
  if (process.env.NODE_ENV === 'development') {
    return error instanceof Error ? error.message : String(error)
  }
  
  // In production, sanitize errors
  const sanitized = sanitizeError(error)
  return sanitized.message
}
