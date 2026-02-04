/**
 * File validation utilities for vault items
 */

// Maximum file size: 100MB
export const MAX_FILE_SIZE = 100 * 1024 * 1024

// Maximum total storage per user: 5GB
export const MAX_USER_STORAGE = 5 * 1024 * 1024 * 1024

// Allowed MIME types by item type
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  image: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  video: [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ],
  legal: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  assets: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ],
  // Password, note, crypto, bank don't have files
  password: [],
  note: [],
  crypto: [],
  bank: [],
  other: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'text/plain',
  ],
}

// Dangerous file extensions to block
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.msi', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.sh', '.bash',
]

export interface FileValidationResult {
  valid: boolean
  error?: string
  fileSize?: number
  mimeType?: string
}

/**
 * Validate file for upload
 */
export function validateFile(
  file: { name: string; size: number; type: string },
  itemType: string
): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    }
  }

  // Check for blocked extensions
  const fileName = file.name.toLowerCase()
  const hasBlockedExtension = BLOCKED_EXTENSIONS.some(ext => fileName.endsWith(ext))
  
  if (hasBlockedExtension) {
    return {
      valid: false,
      error: 'This file type is not allowed for security reasons',
    }
  }

  // Check MIME type for item type
  const allowedTypes = ALLOWED_MIME_TYPES[itemType] || []
  
  // If no file types allowed for this item type, it shouldn't have a file
  if (allowedTypes.length === 0) {
    return {
      valid: false,
      error: `Item type '${itemType}' does not support file uploads`,
    }
  }

  // Validate MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type '${file.type}' is not allowed for ${itemType} items. Allowed types: ${allowedTypes.join(', ')}`,
    }
  }

  return {
    valid: true,
    fileSize: file.size,
    mimeType: file.type,
  }
}

/**
 * Check if user has exceeded storage quota
 */
export async function checkStorageQuota(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase').createServerSupabaseClient>>,
  userId: string,
  additionalSize: number
): Promise<{ allowed: boolean; currentUsage: number; error?: string }> {
  try {
    // Get total storage used by user
    const { data, error } = await supabase
      .from('vault_items')
      .select('file_size')
      .eq('user_id', userId)

    if (error) {
      return {
        allowed: false,
        currentUsage: 0,
        error: 'Failed to check storage quota',
      }
    }

    const currentUsage = data?.reduce((total: number, item: { file_size: number | null }) => {
      return total + (item.file_size || 0)
    }, 0) || 0

    const newTotal = currentUsage + additionalSize

    if (newTotal > MAX_USER_STORAGE) {
      return {
        allowed: false,
        currentUsage,
        error: `Storage quota exceeded. You have used ${(currentUsage / (1024 * 1024 * 1024)).toFixed(2)}GB of ${MAX_USER_STORAGE / (1024 * 1024 * 1024)}GB. This file would exceed your limit.`,
      }
    }

    return {
      allowed: true,
      currentUsage,
    }
  } catch {
    return {
      allowed: false,
      currentUsage: 0,
      error: 'Failed to check storage quota',
    }
  }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
