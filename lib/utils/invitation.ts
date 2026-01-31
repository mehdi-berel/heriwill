import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/utils/logger"

/**
 * Generate a unique invitation code
 */
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 32; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Generate an heir invitation link
 * @param heirId - The heir ID to generate invitation for
 * @param expiresInDays - Number of days until invitation expires (default: 7)
 * @returns The invitation URL
 */
export async function generateHeirInvitationLink(
  heirId: string,
  expiresInDays: number = 7
): Promise<{ url: string; code: string } | null> {
  try {
    const code = generateInvitationCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Update heir with invitation code and expiration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase
      .from('heirs') as any)
      .update({
        invitation_code: code,
        invitation_status: 'pending',
        invitation_expires_at: expiresAt.toISOString(),
        invited_at: new Date().toISOString()
      })
      .eq('id', heirId)

    if (error) {
      logger.error('Failed to generate heir invitation', error)
      return null
    }

    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const url = `${baseUrl}/invite?code=${code}&type=heir`

    logger.info('Heir invitation link generated', { heirId, code })
    return { url, code }
  } catch (error) {
    logger.error('Error generating heir invitation link', error)
    return null
  }
}

/**
 * Generate a notary invitation link
 * @param userId - The user ID who is inviting the notary
 * @param notaryEmail - The email of the notary being invited
 * @param expiresInDays - Number of days until invitation expires (default: 7)
 * @returns The invitation URL
 */
export async function generateNotaryInvitationLink(
  userId: string,
  notaryEmail: string,
  expiresInDays: number = 7
): Promise<{ url: string; code: string } | null> {
  try {
    const code = generateInvitationCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // For notary invitations, we'll need to create a separate invitations table
    // or add invitation tracking to the notaries table
    // For now, return a placeholder
    logger.warn('Notary invitation system not yet implemented')

    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const url = `${baseUrl}/invite?code=${code}&type=notary`

    return { url, code }
  } catch (error) {
    logger.error('Error generating notary invitation link', error)
    return null
  }
}

/**
 * Validate an invitation code
 * @param code - The invitation code to validate
 * @param type - The type of invitation (heir or notary)
 * @returns Whether the invitation is valid
 */
export async function validateInvitationCode(
  code: string,
  type: 'heir' | 'notary'
): Promise<{ valid: boolean; expired: boolean; message?: string }> {
  try {
    if (type === 'heir') {
      const { data: heir, error } = await (supabase
        .from('heirs')
        .select('invitation_status, invitation_expires_at')
        .eq('invitation_code', code)
        .single() as any)

      if (error || !heir) {
        return { valid: false, expired: false, message: 'Invitation not found' }
      }

      if (heir.invitation_status === 'accepted') {
        return { valid: false, expired: false, message: 'Invitation already accepted' }
      }

      if (heir.invitation_status === 'rejected') {
        return { valid: false, expired: false, message: 'Invitation was rejected' }
      }

      const expired = heir.invitation_expires_at
        ? new Date(heir.invitation_expires_at) < new Date()
        : false

      if (expired) {
        return { valid: false, expired: true, message: 'Invitation has expired' }
      }

      return { valid: true, expired: false }
    }

    // Notary validation not yet implemented
    return { valid: false, expired: false, message: 'Notary invitations not yet supported' }
  } catch (error) {
    logger.error('Error validating invitation code', error)
    return { valid: false, expired: false, message: 'Error validating invitation' }
  }
}

/**
 * Resend an heir invitation
 * @param heirId - The heir ID to resend invitation for
 * @param expiresInDays - Number of days until new invitation expires (default: 7)
 * @returns The new invitation URL
 */
export async function resendHeirInvitation(
  heirId: string,
  expiresInDays: number = 7
): Promise<{ url: string; code: string } | null> {
  try {
    // Check current invitation status
    const { data: heir, error: fetchError } = await (supabase
      .from('heirs')
      .select('invitation_status')
      .eq('id', heirId)
      .single() as any)

    if (fetchError || !heir) {
      logger.error('Heir not found for resend', fetchError)
      return null
    }

    if (heir.invitation_status === 'accepted') {
      logger.warn('Cannot resend invitation - already accepted', { heirId })
      return null
    }

    // Generate new invitation
    return await generateHeirInvitationLink(heirId, expiresInDays)
  } catch (error) {
    logger.error('Error resending heir invitation', error)
    return null
  }
}
