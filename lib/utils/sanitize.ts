/**
 * Input Sanitization Utilities
 * Prevents XSS attacks by sanitizing user inputs
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize plain text input (no HTML allowed)
 * Use for: names, titles, descriptions, etc.
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return ''
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true // Keep text content, remove tags
  }).trim()
}

/**
 * Sanitize HTML content (limited safe tags allowed)
 * Use for: rich text editors, formatted content
 */
export function sanitizeHTML(html: string | null | undefined): string {
  if (!html) return ''
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  })
}

/**
 * Sanitize URL (ensure it's safe)
 * Use for: links, redirects
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return ''
  
  try {
    const urlObj = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return ''
    }
    return urlObj.toString()
  } catch {
    return ''
  }
}

/**
 * Sanitize email (basic validation and sanitization)
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return ''
  
  // Remove any HTML and trim
  const cleaned = DOMPurify.sanitize(email, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  }).trim().toLowerCase()
  
  return cleaned
}

/**
 * Sanitize phone number (remove non-numeric except +)
 */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return ''
  
  // Keep only digits, +, -, (, ), and spaces
  return phone.replace(/[^\d\+\-\(\)\s]/g, '').trim()
}

/**
 * Sanitize object with multiple fields
 * Useful for form data
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const sanitized = { ...obj }
  
  fields.forEach(field => {
    const value = obj[field]
    if (typeof value === 'string') {
      sanitized[field] = sanitizeInput(value) as T[keyof T]
    }
  })
  
  return sanitized
}
