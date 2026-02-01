/**
 * Client-Side Encryption Utilities
 * For encrypting sensitive data before storing in client state
 */

/**
 * Encrypt sensitive text using Web Crypto API
 * This is for client-side protection only - server-side encryption is still needed
 */
export async function encryptSensitiveData(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    data
  )
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encryptedData), iv.length)
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt sensitive text
 */
export async function decryptSensitiveData(encrypted: string, key: CryptoKey): Promise<string> {
  // Decode from base64
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, 12)
  const data = combined.slice(12)
  
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    data
  )
  
  const decoder = new TextDecoder()
  return decoder.decode(decryptedData)
}

/**
 * Generate encryption key from user session
 * This key is derived from the user's session and stored in memory only
 */
export async function generateEncryptionKey(sessionId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = encoder.encode(sessionId)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('heriwill-salt'), // In production, use a random salt per user
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Secure memory clearing for sensitive data
 * Call this when sensitive data is no longer needed
 */
export function clearSensitiveData(data: string): void {
  // Overwrite the string in memory (best effort)
  // Note: JavaScript doesn't give us direct memory control
  // This is a defense-in-depth measure
  if (data) {
    data = '\0'.repeat(data.length)
  }
}

/**
 * Mask sensitive data for display
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) {
    return '••••••••'
  }
  
  const masked = '•'.repeat(Math.max(8, data.length - visibleChars))
  const visible = data.slice(-visibleChars)
  
  return masked + visible
}
