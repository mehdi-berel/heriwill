import { supabase } from "@/lib/supabase"

export interface UploadResult {
  success: boolean
  fileUrl?: string
  filePath?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (use 'vault-files' for vault items)
 * @param userId - The user ID for organizing files
 * @param folder - Optional folder within the bucket
 * @returns Upload result with file URL and path
 */
export async function uploadFile(
  file: File,
  bucket: string = 'vault-files',
  userId: string,
  folder?: string
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedFileName}`
    
    // Construct file path
    const pathParts = [userId]
    if (folder) {
      pathParts.push(folder)
    }
    pathParts.push(fileName)
    const filePath = pathParts.join('/')

    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      success: true,
      fileUrl: publicUrl,
      filePath: filePath
    }
  } catch (error) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Delete a file from Supabase Storage
 * @param filePath - The path to the file in storage
 * @param bucket - The storage bucket name
 * @returns Success status
 */
export async function deleteFile(
  filePath: string,
  bucket: string = 'vault-files'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Supabase delete error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }
  } catch (error) {
    console.error('File delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get a signed URL for private file access
 * @param filePath - The path to the file in storage
 * @param bucket - The storage bucket name
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getSignedUrl(
  filePath: string,
  bucket: string = 'vault-files',
  expiresIn: number = 3600
): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Supabase signed URL error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      signedUrl: data.signedUrl
    }
  } catch (error) {
    console.error('Signed URL error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
