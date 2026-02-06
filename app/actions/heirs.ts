"use server"

import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { logger } from '@/lib/utils/logger'

type HeirRow = Database['public']['Tables']['heirs']['Row']
type HeirUpdate = Database['public']['Tables']['heirs']['Update']

interface HeirData {
  user_id: string
  full_name: string
  email: string
  phone?: string | null
  relationship?: string | null
  heir_type?: string
  invitation_expires_at?: string | null
}

// Heir Management Actions

// Create Heir
export async function createHeir(heirData: HeirData) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    // Verify the user_id matches authenticated user
    if (heirData.user_id !== user.id) {
      throw new Error('Unauthorized: Cannot create heir for another user')
    }

    const { data, error } = await supabase
      .from('heirs')
      .insert({
        user_id: heirData.user_id,
        full_name_encrypted: heirData.full_name,
        email_encrypted: heirData.email,
        phone_encrypted: heirData.phone || null,
        relationship: heirData.relationship || null,
        heir_type: heirData.heir_type || 'family',
        invitation_status: 'pending',
        invitation_code: generateInvitationCode(),
        invited_at: new Date().toISOString(),
        invitation_expires_at: heirData.invitation_expires_at || null,
        notify_on_activation: true,
        notification_delay_days: 0,
        is_active: true
      })
      .select()
      .single()

  if (error) throw new Error('Failed to create heir')
  return data
}

// Update Heir
export async function updateHeir(heirId: string, updateData: HeirUpdate) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    // Verify ownership before update
    const { data: existingHeir, error: fetchError } = await supabase
      .from('heirs')
      .select('user_id')
      .eq('id', heirId)
      .single()

    if (fetchError || !existingHeir) {
      throw new Error('Heir not found')
    }

    if (existingHeir.user_id !== user.id) {
      throw new Error('Unauthorized: You do not own this heir')
    }

    const { data, error } = await supabase
      .from('heirs')
      .update(updateData)
      .eq('id', heirId)
      .eq('user_id', user.id)
      .select()
      .single()

  if (error) throw new Error('Failed to update heir')
  return data
}

// Delete Heir
export async function deleteHeir(heirId: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Not authenticated')
    }

    // Verify ownership before delete
    const { data: existingHeir, error: fetchError } = await supabase
      .from('heirs')
      .select('user_id, heir_user_id')
      .eq('id', heirId)
      .single()

    if (fetchError || !existingHeir) {
      throw new Error('Heir not found')
    }

    if (existingHeir.user_id !== user.id) {
      throw new Error('Unauthorized: You do not own this heir')
    }

    // Use service role client for foreign key cleanup to bypass RLS
    const serviceClient = createServiceRoleClient()

    // Clear trusted_contact_heir_id if it references this heir
    await serviceClient
      .from('users')
      .update({ trusted_contact_heir_id: null })
      .eq('trusted_contact_heir_id', heirId)

    // Remove shared_vaults records for this heir
    if (existingHeir.heir_user_id) {
      await serviceClient
        .from('shared_vaults')
        .delete()
        .eq('shared_with_user_id', existingHeir.heir_user_id)
        .eq('owner_id', user.id)
    }

    // Delete the heir record using regular client (respects RLS)
    const { error } = await supabase
      .from('heirs')
      .delete()
      .eq('id', heirId)
      .eq('user_id', user.id)

  if (error) throw new Error('Failed to delete heir')
}

// Get Heir by ID
export async function getHeirById(heirId: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('heirs')
      .select('*')
      .eq('id', heirId)
      .single()

  if (error) throw new Error('Heir not found')
  return data
}

// Get All Heirs for User
export async function getAllHeirs(userId: string, page = 1, pageSize = 50): Promise<{ data: HeirRow[]; total: number; page: number; pageSize: number }> {
    const emptyResult = { data: [] as HeirRow[], total: 0, page, pageSize }

    try {
      const supabase = await createServerSupabaseClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return emptyResult
      if (userId !== user.id) return emptyResult

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await supabase
        .from('heirs')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        logger.error('Error fetching heirs', error, { userId })
        return emptyResult
      }
      return { data: data || [], total: count ?? 0, page, pageSize }
    } catch (error) {
      logger.error('Error in getAllHeirs', error, { userId })
      return emptyResult
    }
}

// Invitation Management
export async function resendInvitation(heirId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: existingHeir, error: fetchError } = await supabase
    .from('heirs')
    .select('user_id')
    .eq('id', heirId)
    .single()
  if (fetchError || !existingHeir) throw new Error('Heir not found')
  if (existingHeir.user_id !== user.id) throw new Error('Unauthorized')

    // TODO: Implement email sending service
    // await sendInvitationEmail(heir.email_encrypted, heir.invitation_code)
    
    // Update invitation status
    const { data } = await supabase
      .from('heirs')
      .update({ invitation_status: 'pending' })
      .eq('id', heirId)
      .eq('user_id', user.id)
      .select()
      .single()

  return data
}

// Revoke Access
export async function revokeAccess(heirId: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    // Verify ownership
    const { data: existingHeir, error: fetchError } = await supabase
      .from('heirs')
      .select('user_id')
      .eq('id', heirId)
      .single()
    if (fetchError || !existingHeir) throw new Error('Heir not found')
    if (existingHeir.user_id !== user.id) throw new Error('Unauthorized')

    const { data } = await supabase
      .from('heirs')
      .update({ invitation_status: 'rejected' })
      .eq('id', heirId)
      .eq('user_id', user.id)
      .select()
      .single()

  return data
}

// Update Verification Status
export async function updateVerificationStatus(heirId: string, status: string) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')

    // Verify ownership
    const { data: existingHeir, error: fetchError } = await supabase
      .from('heirs')
      .select('user_id')
      .eq('id', heirId)
      .single()
    if (fetchError || !existingHeir) throw new Error('Heir not found')
    if (existingHeir.user_id !== user.id) throw new Error('Unauthorized')

    const { data } = await supabase
      .from('heirs')
      .update({ notification_status: status })
      .eq('id', heirId)
      .eq('user_id', user.id)
      .select()
      .single()

  return data
}

// Get Heir Statistics
export async function getHeirStats(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')
  if (userId !== user.id) throw new Error('Unauthorized')
  
  // Single SQL query with aggregation instead of fetching all and filtering in JS
  const { data, error } = await supabase.rpc('get_heir_stats', { p_user_id: user.id })
  
  if (error) {
    // Fallback to old method if RPC doesn't exist yet
    const { data: heirs } = await getAllHeirs(userId, 1, 1000)
    return {
      totalHeirs: heirs.length,
      acceptedHeirs: heirs.filter((h: HeirRow) => h.invitation_status === 'accepted').length,
      pendingHeirs: heirs.filter((h: HeirRow) => h.invitation_status === 'pending').length,
      rejectedHeirs: heirs.filter((h: HeirRow) => h.invitation_status === 'rejected').length,
      expiredHeirs: heirs.filter((h: HeirRow) => {
        return h.invitation_expires_at && new Date(h.invitation_expires_at) < new Date()
      }).length,
      verifiedHeirs: heirs.filter((h: HeirRow) => h.notification_status === 'verified').length,
      familyHeirs: heirs.filter((h: HeirRow) => h.heir_type === 'family').length,
      friendHeirs: heirs.filter((h: HeirRow) => h.heir_type === 'friend').length,
      professionalHeirs: heirs.filter((h: HeirRow) => h.heir_type === 'professional').length,
      organizationHeirs: heirs.filter((h: HeirRow) => h.heir_type === 'organization').length
    }
  }
  
  return data
}

// Search and Filter (auth check delegated to getAllHeirs)
export async function searchHeirs(userId: string, searchTerm: string) {
  const { data: heirs } = await getAllHeirs(userId, 1, 1000)
    
    const filteredHeirs = heirs.filter((heir: HeirRow) =>
      heir.full_name_encrypted?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      heir.email_encrypted?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      heir.relationship?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  return filteredHeirs
}

// Filter by Status
export async function getHeirsByStatus(userId: string, status: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')
  if (userId !== user.id) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('heirs')
    .select('*')
    .eq('user_id', user.id)
    .eq('invitation_status', status)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error('Failed to fetch heirs')
  return data || []
}

// Filter by Heir Type
export async function getHeirsByType(userId: string, heirType: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')
  if (userId !== user.id) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('heirs')
    .select('*')
    .eq('user_id', user.id)
    .eq('heir_type', heirType)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error('Failed to fetch heirs')
  return data || []
}

// Remove Successor Role (heir-side: heir removes themselves from an owner's heir list)
export async function removeSuccessorRole(heirId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Verify the current user is the heir (heir_user_id matches)
  const { data: heirData, error: heirError } = await supabase
    .from('heirs')
    .select('id, user_id, heir_user_id')
    .eq('id', heirId)
    .eq('heir_user_id', user.id)
    .single()

  if (heirError || !heirData) {
    throw new Error('Successor role not found or unauthorized')
  }

  // Clear trusted_contact_heir_id if it references this heir
  await supabase
    .from('users')
    .update({ trusted_contact_heir_id: null })
    .eq('trusted_contact_heir_id', heirId)

  // Remove shared_vaults records granted to this heir
  await supabase
    .from('shared_vaults')
    .delete()
    .eq('shared_with_user_id', user.id)
    .eq('owner_id', heirData.user_id)

  // Delete the heir record
  const { error } = await supabase
    .from('heirs')
    .delete()
    .eq('id', heirId)
    .eq('heir_user_id', user.id)

  if (error) throw new Error('Failed to remove successor role')
}

// Get Death Notification Status for a successor card
export async function getDeathNotificationStatus(ownerUserId: string, heirId: string) {
  const defaultResult = {
    hasNotification: false,
    totalHeirs: 0,
    confirmedHeirs: 0,
    confirmationProgress: 0,
    alreadyConfirmed: false
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return defaultResult

    const { data: ownerData } = await supabase
      .from('users')
      .select('global_trigger_method, global_trigger_settings')
      .eq('id', ownerUserId)
      .single()

    if (ownerData?.global_trigger_method !== 'heir_notification') {
      return defaultResult
    }

    const settings = ownerData.global_trigger_settings as { confirmed_heir_ids?: string[] } | null
    const confirmedHeirIds = settings?.confirmed_heir_ids || []

    const { data: heirsData } = await supabase
      .from('heirs')
      .select('id')
      .eq('user_id', ownerUserId)
      .eq('is_active', true)
      .eq('has_accepted', true)

    const totalHeirs = heirsData?.length || 0
    const confirmedHeirs = confirmedHeirIds.length

    return {
      hasNotification: true,
      totalHeirs,
      confirmedHeirs,
      confirmationProgress: totalHeirs > 0 ? (confirmedHeirs / totalHeirs) * 100 : 0,
      alreadyConfirmed: confirmedHeirIds.includes(heirId)
    }
  } catch (error) {
    logger.error('Error in getDeathNotificationStatus', error, { ownerUserId, heirId })
    return defaultResult
  }
}

// Check if a heir is the trusted contact for an owner
export async function getOwnerTrustedContactStatus(ownerUserId: string, heirId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return false

    const { data: ownerData } = await supabase
      .from('users')
      .select('trusted_contact_heir_id')
      .eq('id', ownerUserId)
      .single()

    const owner = ownerData as { trusted_contact_heir_id?: string | null } | null
    return owner?.trusted_contact_heir_id === heirId
  } catch (error) {
    logger.error('Error in getOwnerTrustedContactStatus', error, { ownerUserId, heirId })
    return false
  }
}

// Get Heir Activities from audit logs
export async function getHeirActivities(heirId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('resource_type', 'heir')
    .eq('resource_id', heirId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw new Error('Failed to fetch heir activities')

  return (data || []).map((activity: Record<string, unknown>) => ({
    id: activity.id as string,
    type: activity.action as string,
    description: (activity.metadata as Record<string, unknown>)?.description as string || activity.action as string,
    timestamp: activity.created_at as string,
    metadata: activity.metadata as Record<string, unknown>
  }))
}

// Helper Functions
function generateInvitationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
