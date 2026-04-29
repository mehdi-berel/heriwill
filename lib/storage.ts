import { supabase } from './supabase'
import { logger } from './utils/logger'

// Storage bucket names
export const STORAGE_BUCKETS = {
  VAULT_ITEMS: 'vault-files',
  LEGAL_DOCUMENTS: 'legal-documents',
  AVATARS: 'avatars',
  ASSETS: 'assets',
} as const

// File type validation
const ALLOWED_FILE_TYPES = {
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  all: ['*/*']
}

// Max file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024

export interface UploadResult {
  success: boolean
  fileUrl?: string
  filePath?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  bucket: keyof typeof STORAGE_BUCKETS,
  userId: string,
  folder?: string
): Promise<UploadResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      }
    }

    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = folder 
      ? `${userId}/${folder}/${timestamp}_${sanitizedFileName}`
      : `${userId}/${timestamp}_${sanitizedFileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      logger.error('Upload error', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .getPublicUrl(filePath)

    return {
      success: true,
      fileUrl: publicUrl,
      filePath: data.path
    }
  } catch (error) {
    logger.error('Upload exception', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .remove([filePath])

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  filePath: string
): Promise<{ success: boolean; blob?: Blob; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .download(filePath)

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      blob: data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Download failed'
    }
  }
}

/**
 * Get user's total storage usage
 */
export async function getUserStorageUsage(userId: string): Promise<number> {
  try {
    let totalSize = 0

    // Check all buckets
    for (const bucket of Object.values(STORAGE_BUCKETS)) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(userId, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (!error && data) {
        totalSize += data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
      }
    }

    return totalSize
  } catch (error) {
    logger.error('Error calculating storage usage', error)
    return 0
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: keyof typeof ALLOWED_FILE_TYPES = 'all'): boolean {
  const allowed = ALLOWED_FILE_TYPES[allowedTypes]
  
  if (allowed.includes('*/*')) return true
  
  return allowed.some(type => {
    if (type.endsWith('/*')) {
      const category = type.split('/')[0]
      return file.type.startsWith(category + '/')
    }
    return file.type === type
  })
}
