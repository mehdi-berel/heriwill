import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'

/**
 * Send false alarm notification to heir
 * Notifies heir that the inheritance trigger was a false alarm
 */
export async function sendFalseAlarmEmail(params: {
  heirEmail: string
  heirName: string
  ownerName: string
}): Promise<boolean> {
  try {
    const { heirEmail, heirName, ownerName } = params

    const supabase = await createServerSupabaseClient()
    // Use Supabase Auth to send email
    // Note: Email template is configured in Supabase
    // Note: This requires proper email configuration in Supabase
    const { error } = await supabase.auth.admin.inviteUserByEmail(heirEmail, {
      data: {
        email_type: 'false_alarm',
        owner_name: ownerName,
        heir_name: heirName,
      },
      redirectTo: 'https://app.heriwill.com/dashboard',
    })

    if (error) {
      logger.error('Failed to send false alarm email', { error, heirEmail })
      return false
    }

    logger.info('False alarm email sent successfully', { heirEmail })
    return true
  } catch (error) {
    logger.error('Error sending false alarm email', error)
    return false
  }
}

/**
 * Send inheritance trigger notification to heir
 * Notifies heir that they have been granted access to vaults
 */
export async function sendInheritanceNotificationEmail(params: {
  heirEmail: string
  heirName: string
  ownerName: string
  vaultName?: string
}): Promise<boolean> {
  try {
    const { heirEmail, heirName, ownerName, vaultName } = params

    // Email template would be configured in email service
    // For now, we'll use a simple approach
    // In production, you'd want to use a proper email service like Resend, SendGrid, etc.
    logger.info('Inheritance notification email prepared', { heirEmail, heirName, ownerName, vaultName })
    
    // TODO: Integrate with actual email service
    // For now, just log that we would send this
    return true
  } catch (error) {
    logger.error('Error sending inheritance notification email', error)
    return false
  }
}
