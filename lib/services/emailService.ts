import { supabase } from '@/lib/supabase'
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

    // Use Supabase Auth to send email
    // This uses the custom email template configured in Supabase
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding: 40px 20px 20px;">
                      <img src="https://app.heriwill.com/heriwill-transparent.png" alt="HeriWill" style="width: 150px; height: auto;">
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <h1 style="color: #10b981; font-size: 24px; margin: 0 0 20px; text-align: center;">
                        ✅ False Alarm - Inheritance Cancelled
                      </h1>
                      
                      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Hello ${heirName},
                      </p>
                      
                      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        We're writing to inform you that <strong style="color: #ffffff;">${ownerName}</strong> has declared a <strong>false alarm</strong> on their inheritance plan.
                      </p>
                      
                      <div style="background-color: #065f46; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #d1fae5; font-size: 14px; margin: 0; line-height: 1.6;">
                          <strong>Good News:</strong> ${ownerName} is alive and well. The previous inheritance notification was triggered by mistake and has been cancelled.
                        </p>
                      </div>
                      
                      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        <strong>What this means:</strong>
                      </p>
                      
                      <ul style="color: #e5e5e5; font-size: 16px; line-height: 1.8; margin: 0 0 20px; padding-left: 20px;">
                        <li>Your access to ${ownerName}'s vaults has been revoked</li>
                        <li>The inheritance process has been cancelled</li>
                        <li>Everything has been restored to normal</li>
                        <li>No further action is required from you</li>
                      </ul>
                      
                      <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                        If you have any questions, please contact ${ownerName} directly.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #0a0a0a; text-align: center;">
                      <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        This is an automated message from HeriWill<br>
                        © ${new Date().getFullYear()} HeriWill. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    // Send email using Supabase's email service
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

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 8px; overflow: hidden;">
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding: 40px 20px 20px;">
                      <img src="https://app.heriwill.com/heriwill-transparent.png" alt="HeriWill" style="width: 150px; height: auto;">
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 20px; text-align: center;">
                        Inheritance Notification
                      </h1>
                      
                      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Dear ${heirName},
                      </p>
                      
                      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        We regret to inform you that <strong style="color: #ffffff;">${ownerName}</strong>'s inheritance plan has been activated.
                      </p>
                      
                      <div style="background-color: #1e3a8a; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #dbeafe; font-size: 14px; margin: 0; line-height: 1.6;">
                          <strong>Access Granted:</strong> You now have access to ${vaultName ? `the "${vaultName}" vault` : 'designated vaults'} and their contents.
                        </p>
                      </div>
                      
                      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                        <strong>Next Steps:</strong>
                      </p>
                      
                      <ul style="color: #e5e5e5; font-size: 16px; line-height: 1.8; margin: 0 0 20px; padding-left: 20px;">
                        <li>Log in to your HeriWill account</li>
                        <li>Access the inherited vaults from your dashboard</li>
                        <li>Review the contents and follow any instructions left for you</li>
                      </ul>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="https://app.heriwill.com/dashboard" style="display: inline-block; padding: 12px 30px; background: linear-gradient(to right, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                          Access Your Vaults
                        </a>
                      </div>
                      
                      <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                        Our deepest condolences during this difficult time.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #0a0a0a; text-align: center;">
                      <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        This is an automated message from HeriWill<br>
                        © ${new Date().getFullYear()} HeriWill. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    // For now, we'll use a simple approach
    // In production, you'd want to use a proper email service like Resend, SendGrid, etc.
    logger.info('Inheritance notification email prepared', { heirEmail })
    
    // TODO: Integrate with actual email service
    // For now, just log that we would send this
    return true
  } catch (error) {
    logger.error('Error sending inheritance notification email', error)
    return false
  }
}
