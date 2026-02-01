/**
 * Input Validation Utilities
 * 
 * Provides validation functions for user inputs
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' }
  }

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  if (email.length > 255) {
    return { isValid: false, error: 'Email is too long' }
  }

  return { isValid: true }
}

/**
 * Validate phone number (international format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: true } // Phone is optional
  }

  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '')
  
  // Check if it starts with + and has 10-15 digits
  const phoneRegex = /^\+?[1-9]\d{9,14}$/
  if (!phoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Invalid phone number format. Use international format (e.g., +1234567890)' }
  }

  return { isValid: true }
}

/**
 * Validate full name
 */
export function validateFullName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Full name is required' }
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters' }
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Full name is too long (max 100 characters)' }
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(name)) {
    return { isValid: false, error: 'Full name must contain at least one letter' }
  }

  return { isValid: true }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' }
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (max 128 characters)' }
  }

  // Require at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  if (!hasLetter || !hasNumber) {
    return { 
      isValid: false,
      error: 'Password must contain both letters and numbers' 
    }
  }

  return { isValid: true }
}

/**
 * Validate text field (generic)
 */
export function validateTextField(
  value: string, 
  fieldName: string,
  options: {
    required?: boolean
    minLength?: number
    maxLength?: number
  } = {}
): ValidationResult {
  const { required = false, minLength = 0, maxLength = 1000 } = options

  if (required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  if (!value || value.trim().length === 0) {
    return { isValid: true } // Optional field, empty is ok
  }

  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` }
  }

  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} is too long (max ${maxLength} characters)` }
  }

  return { isValid: true }
}

/**
 * Sanitize text input (remove dangerous characters)
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  
  // Remove null bytes and control characters except newlines and tabs
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: true } // URL is optional
  }

  try {
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'URL must use http or https protocol' }
    }
    return { isValid: true }
  } catch {
    return { isValid: false, error: 'Invalid URL format' }
  }
}

/**
 * Validate currency code (ISO 4217)
 */
export function validateCurrency(currency: string): ValidationResult {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR']
  
  if (!currency || !validCurrencies.includes(currency.toUpperCase())) {
    return { isValid: false, error: 'Invalid currency code' }
  }

  return { isValid: true }
}

/**
 * Validate timezone
 */
export function validateTimezone(timezone: string): ValidationResult {
  if (!timezone || timezone.trim().length === 0) {
    return { isValid: false, error: 'Timezone is required' }
  }

  // Basic validation - check if it's a reasonable timezone format
  if (timezone.length > 50) {
    return { isValid: false, error: 'Invalid timezone' }
  }

  return { isValid: true }
}
