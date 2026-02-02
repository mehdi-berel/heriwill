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
  heir_type?: 'family' | 'friend' | 'professional' | 'organization'
  code_validity_days?: number
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

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
  const sanitizedFullName = sanitizeInput(data.full_name)
  const sanitizedEmail = sanitizeEmail(data.email)
  const sanitizedPhone = data.phone ? sanitizePhone(data.phone) : null
  const sanitizedRelationship = data.relationship ? sanitizeInput(data.relationship) : null

  // Create heir with invitation
  const { data: heir, error } = await supabase
    .from('heirs')
    .insert({
      user_id: user.id,
      full_name_encrypted: sanitizedFullName,
      email_encrypted: sanitizedEmail,
      phone_encrypted: sanitizedPhone,
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
    })
    .select()
    .single()

  if (error) {
    logger.error('Error creating heir invitation', error)
    throw error
  }

  return {
    heir,
    invitationCode,
    expiresAt: expirationDate.toISOString()
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
 */
export async function rejectHeirInvitation(invitationCode: string) {
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

  // Reject invitation
  const { data: heir, error } = await supabase
    .from('heirs')
    .update({
      invitation_status: 'rejected',
      rejected_at: new Date().toISOString(),
      is_active: false,
    })
    .eq('invitation_code', invitationCode)
    .eq('invitation_status', 'pending')
    .select()
    .single()

  if (error) {
    logger.error('Error rejecting invitation', error)
    throw error
  }

  // Notify the owner that heir rejected
  try {
    const heirName = user.user_metadata?.full_name || user.email || 'An heir'
    await notifyHeirRejected(heir.user_id, heirName)
  } catch (notificationError) {
    logger.error('Error creating heir rejected notification', notificationError)
  }

  return heir
}

/**
 * Get pending invitations for current user (where they are the heir)
 */
export async function getPendingInvitations() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data: heirs, error } = await supabase
    .from('heirs')
    .select('*, users!heirs_user_id_fkey(full_name, email)')
    .eq('email_encrypted', user.email || '')
    .eq('invitation_status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching pending invitations', error)
    return []
  }

  return heirs || []
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
