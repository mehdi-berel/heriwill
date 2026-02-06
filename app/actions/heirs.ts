"use server"

import { createServerSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

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

  if (error) throw new Error(error.message)
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

  if (error) throw new Error(error.message)
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

    // Clear trusted_contact_heir_id if it references this heir
    await supabase
      .from('users')
      .update({ trusted_contact_heir_id: null })
      .eq('trusted_contact_heir_id', heirId)

    // Remove shared_vaults records for this heir
    if (existingHeir.heir_user_id) {
      await supabase
        .from('shared_vaults')
        .delete()
        .eq('shared_with_user_id', existingHeir.heir_user_id)
        .eq('owner_id', user.id)
    }

    // Delete the heir record
    const { error } = await supabase
      .from('heirs')
      .delete()
      .eq('id', heirId)
      .eq('user_id', user.id)

  if (error) throw new Error(error.message)
}

// Get Heir by ID
export async function getHeirById(heirId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('heirs')
      .select('*')
      .eq('id', heirId)
      .single()

  if (error) throw new Error(error.message)
  return data
}

// Get All Heirs for User
export async function getAllHeirs(userId: string, page = 1, pageSize = 50): Promise<{ data: HeirRow[]; total: number; page: number; pageSize: number }> {
    const supabase = await createServerSupabaseClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('heirs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

  if (error) throw new Error(error.message)
  return { data: data || [], total: count ?? 0, page, pageSize }
}

// Invitation Management
export async function resendInvitation(heirId: string) {
  const heir = await getHeirById(heirId)
    if (!heir) throw new Error('Heir not found')

    // TODO: Implement email sending service
    // await sendInvitationEmail(heir.email_encrypted, heir.invitation_code)
    
    // Update invitation status
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('heirs')
      .update({ invitation_status: 'pending' })
      .eq('id', heirId)
      .select()
      .single()

  return data
}

// Revoke Access
export async function revokeAccess(heirId: string) {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('heirs')
      .update({ invitation_status: 'rejected' })
      .eq('id', heirId)
      .select()
      .single()

  return data
}

// Update Verification Status
export async function updateVerificationStatus(heirId: string, status: string) {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('heirs')
      .update({ notification_status: status }) // mapped verification_status to notification_status or similar if needed, check DB
      .eq('id', heirId)
      .select()
      .single()

  return data
}

// Get Heir Statistics
export async function getHeirStats(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  // Single SQL query with aggregation instead of fetching all and filtering in JS
  const { data, error } = await supabase.rpc('get_heir_stats', { p_user_id: userId })
  
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

// Search and Filter
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
  const { data, error } = await supabase
    .from('heirs')
    .select('*')
    .eq('user_id', userId)
    .eq('invitation_status', status)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data || []
}

// Filter by Heir Type
export async function getHeirsByType(userId: string, heirType: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('heirs')
    .select('*')
    .eq('user_id', userId)
    .eq('heir_type', heirType)
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
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

  if (error) throw new Error(error.message)
}

// Helper Functions
function generateInvitationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
