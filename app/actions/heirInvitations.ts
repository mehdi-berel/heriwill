"use server"

import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { sanitizeInput, sanitizeEmail, sanitizePhone } from '@/lib/utils/sanitize'
import { notifyHeirAccepted, notifyHeirRejected } from '@/lib/services/notificationService'

/**
 * Generate a unique invitation code
 * Format: XXXX-XXXX (8 characters)
 */
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude similar looking characters
  let code = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Create heir invitation with unique code
 */
export async function createHeirInvitation(data: {
  full_name: string
  email: string
  phone?: string
  relationship?: string
  heir_type?: 'family' | 'friend' | 'professional' | 'organization' | 'notary'
  code_validity_days?: number
}) {
  try {
    logger.info('Creating heir invitation', { email: data.email, heir_type: data.heir_type })
    
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      logger.error('Auth error in createHeirInvitation', authError)
      throw new Error('Authentication failed: ' + authError.message)
    }
    
    if (!user) {
      logger.error('No user found in createHeirInvitation')
      throw new Error('Not authenticated')
    }
    
    logger.info('User authenticated', { userId: user.id })

  // Generate unique invitation code
  let invitationCode = generateInvitationCode()
  let attempts = 0
  const maxAttempts = 10

  // Ensure code is unique
  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from('heirs')
      .select('id')
      .eq('invitation_code', invitationCode)
      .single()

    if (!existing) break
    invitationCode = generateInvitationCode()
    attempts++
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique invitation code')
  }

  // Calculate expiration date
  const codeValidityDays = data.code_validity_days || 7
  const expirationDate = new Date()
  expirationDate.setTime(expirationDate.getTime() + (codeValidityDays * 24 * 60 * 60 * 1000))

  // Sanitize inputs before storing
  logger.info('Sanitizing inputs')
  let sanitizedFullName, sanitizedEmail, sanitizedPhone, sanitizedRelationship
  
  try {
    sanitizedFullName = sanitizeInput(data.full_name)
    sanitizedEmail = sanitizeEmail(data.email)
    sanitizedPhone = data.phone ? sanitizePhone(data.phone) : null
    sanitizedRelationship = data.relationship ? sanitizeInput(data.relationship) : null
    logger.info('Inputs sanitized successfully')
  } catch (sanitizeError) {
    logger.error('Error sanitizing inputs', sanitizeError, { data })
    throw new Error('Failed to sanitize input data: ' + (sanitizeError as Error).message)
  }

  // Create heir with invitation
  logger.info('Inserting heir into database', { invitationCode })
  
  const insertData = {
    user_id: user.id,
    name: sanitizedFullName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    relationship: sanitizedRelationship,
    heir_type: data.heir_type || 'family',
    invitation_code: invitationCode,
    invitation_status: 'pending',
    invitation_expires_at: expirationDate.toISOString(),
    invited_at: new Date().toISOString(),
    is_active: false,
    has_accepted: false,
    notify_on_activation: true,
    notification_delay_days: 0,
  }
  
  const { data: heir, error } = await supabase
    .from('heirs')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    logger.error('Database error creating heir invitation', error, { 
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details,
      insertData: { ...insertData, name: '[REDACTED]', email: '[REDACTED]' }
    })
    throw new Error('Failed to create heir invitation: ' + error.message)
  }
  
  logger.info('Heir created successfully', { heirId: heir.id })

  // Create notification for the user who created the heir
  try {
    const { createNotification } = await import('@/lib/services/notificationService')
    await createNotification({
      userId: user.id,
      type: 'heir_invitation',
      title: 'Heir invitation created',
      message: `You have successfully invited ${sanitizedFullName} (${sanitizedEmail}) as an heir. Invitation code: ${invitationCode}`,
      actionUrl: '/heirs',
      actionLabel: 'View Heirs',
      priority: 'normal',
      metadata: {
        heirId: heir.id,
        invitationCode,
        heirEmail: sanitizedEmail
      }
    })
  } catch (notifError) {
    // Don't fail the heir creation if notification fails
    logger.error('Failed to create notification for heir invitation', notifError)
  }

    logger.info('Heir invitation created successfully', { heirId: heir.id })
    
    return {
      heir,
      invitationCode,
      expiresAt: expirationDate.toISOString()
    }
  } catch (error) {
    logger.error('Unexpected error in createHeirInvitation', error, {
      errorName: (error as Error).name,
      errorMessage: (error as Error).message,
      errorStack: (error as Error).stack
    })
    throw error
  }
}

/**
 * Validate invitation code
 */
export async function validateInvitationCode(code: string) {
  const supabase = await createServerSupabaseClient()
  const { data: heir, error } = await supabase
    .from('heirs')
    .select('*')
    .eq('invitation_code', code)
    .single()

  if (error || !heir) {
    return {
      valid: false,
      error: 'Code d\'invitation invalide ou introuvable'
    }
  }

  // Check status
  if (heir.invitation_status !== 'pending') {
    return {
      valid: false,
      error: `Cette invitation a déjà été ${heir.invitation_status === 'accepted' ? 'acceptée' : 'rejetée'}`
    }
  }

  // Check expiration
  if (heir.invitation_expires_at && new Date(heir.invitation_expires_at) < new Date()) {
    // Mark as expired
    await supabase
      .from('heirs')
      .update({ invitation_status: 'expired' })
      .eq('id', heir.id)

    return {
      valid: false,
      error: 'Cette invitation a expiré'
    }
  }

  return {
    valid: true,
    heir
  }
}

/**
 * Accept heir invitation
 */
export async function acceptHeirInvitation(invitationCode: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Validate code first
  const validation = await validateInvitationCode(invitationCode)
  if (!validation.valid || !validation.heir) {
    throw new Error(validation.error || 'Code invalide')
  }

  // Prevent self-invitation
  if (validation.heir.user_id === user.id) {
    throw new Error('Vous ne pouvez pas être votre propre héritier')
  }

  // Accept invitation
  const { data: heir, error } = await supabase
    .from('heirs')
    .update({
      heir_user_id: user.id,
      has_accepted: true,
      accepted_at: new Date().toISOString(),
      invitation_status: 'accepted',
      is_active: true,
    })
    .eq('invitation_code', invitationCode)
    .eq('invitation_status', 'pending')
    .select()
    .single()

  if (error) {
    logger.error('Error accepting invitation', error)
    throw error
  }

  // Notify the owner that heir accepted
  try {
    const heirName = user.user_metadata?.full_name || user.email || 'An heir'
    await notifyHeirAccepted(heir.user_id, heirName)
  } catch (notificationError) {
    logger.error('Error creating heir accepted notification', notificationError)
  }

  return heir
}

/**
 * Reject heir invitation
 * Note: This now directly updates the database since server actions can't reliably call API routes
 */
export async function rejectHeirInvitation(invitationCode: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    logger.error('No user found in rejectHeirInvitation')
    throw new Error('Not authenticated')
  }

  logger.info('Rejecting heir invitation', { invitationCode, userId: user.id })

  try {
    // First, verify the invitation exists and is pending
    const { data: existingHeir, error: fetchError } = await supabase
      .from('heirs')
      .select('*')
      .eq('invitation_code', invitationCode)
      .eq('invitation_status', 'pending')
      .single()

    if (fetchError || !existingHeir) {
      logger.error('Invitation not found or already processed', fetchError)
      throw new Error('Invitation not found or already processed')
    }

    // Check if invitation has expired
    if (existingHeir.invitation_expires_at && new Date(existingHeir.invitation_expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('heirs')
        .update({ invitation_status: 'expired' })
        .eq('id', existingHeir.id)

      throw new Error('This invitation has expired')
    }

    // Update the invitation status to rejected
    // This works because we're updating by ID, not by user_id
    const { data: updatedHeir, error: updateError } = await supabase
      .from('heirs')
      .update({
        invitation_status: 'rejected',
        rejected_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', existingHeir.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Error updating heir invitation status', updateError, {
        heirId: existingHeir.id,
        errorCode: updateError.code,
        errorMessage: updateError.message
      })
      throw new Error('Failed to reject invitation: ' + updateError.message)
    }

    logger.info('Heir invitation rejected successfully', { heirId: updatedHeir.id })

    // Notify the owner that heir rejected
    try {
      const heirName = user.user_metadata?.full_name || user.email || 'An heir'
      await notifyHeirRejected(existingHeir.user_id, heirName)
    } catch (notificationError) {
      logger.error('Error creating heir rejected notification', notificationError)
      // Don't fail the request if notification fails
    }

    return updatedHeir
  } catch (error) {
    logger.error('Error in rejectHeirInvitation', error, {
      errorName: (error as Error).name,
      errorMessage: (error as Error).message
    })
    throw error
  }
}

/**
 * Get pending and accepted invitations for current user (where they are the heir)
 */
export async function getPendingInvitations(userId?: string, userEmail?: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Try cookie-based auth first, fall back to provided params
    let authenticatedUserId = userId
    let authenticatedUserEmail = userEmail

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      authenticatedUserId = user.id
      authenticatedUserEmail = user.email ?? userEmail
    }

    if (!authenticatedUserId) {
      logger.info('No user found in getPendingInvitations')
      return []
    }

    // If cookie auth succeeded, validate that provided userId matches
    if (user && userId && userId !== user.id) {
      logger.warn('User ID mismatch in getPendingInvitations', { provided: userId, actual: user.id })
      return []
    }

    logger.info('Fetching pending invitations for user', { userId: authenticatedUserId, email: authenticatedUserEmail })

    // Query 1: Get accepted invitations where heir_user_id matches
    const { data: acceptedByUserId, error: error2 } = await supabase
      .from('heirs')
      .select('*')
      .eq('heir_user_id', authenticatedUserId)
      .eq('invitation_status', 'accepted')
      .order('created_at', { ascending: false })

    if (error2) {
      logger.error('Error fetching accepted invitations by user_id', error2)
    }

    // Query 2: Get pending invitations where user's email matches
    let pendingByEmail: typeof acceptedByUserId = null
    if (authenticatedUserEmail) {
      try {
        const sanitizedUserEmail = sanitizeEmail(authenticatedUserEmail)

        const { data, error: error1 } = await supabase
          .from('heirs')
          .select('*')
          .eq('email', sanitizedUserEmail)
          .eq('invitation_status', 'pending')
          .order('created_at', { ascending: false })

        if (error1) {
          logger.error('Error fetching pending invitations by email', error1)
        }
        pendingByEmail = data
      } catch (emailError) {
        logger.error('Error sanitizing email for pending invitations', emailError)
      }
    }

    // Combine results and remove duplicates
    const allInvitations = [...(pendingByEmail || []), ...(acceptedByUserId || [])]
    const uniqueInvitations = allInvitations.filter((inv, index, self) =>
      index === self.findIndex((t) => t.id === inv.id)
    )

    // Fetch owner user data separately to avoid RLS issues with JOINs
    const invitationsWithOwnerData = await Promise.all(
      uniqueInvitations.map(async (invitation) => {
        const { data: ownerData } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', invitation.user_id)
          .single()
        
        return {
          ...invitation,
          users: ownerData || { full_name: null, email: null }
        }
      })
    )

    logger.info('Invitations fetched', { 
      pendingCount: pendingByEmail?.length || 0,
      acceptedCount: acceptedByUserId?.length || 0,
      totalUnique: invitationsWithOwnerData.length 
    })

    return invitationsWithOwnerData
  } catch (error) {
    logger.error('Error in getPendingInvitations', error)
    return []
  }
}

/**
 * Cancel invitation (by owner)
 */
export async function cancelHeirInvitation(heirId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('heirs')
    .delete()
    .eq('id', heirId)
    .eq('user_id', user.id)
    .eq('invitation_status', 'pending')

  if (error) {
    logger.error('Error canceling invitation', error)
    throw error
  }
}
