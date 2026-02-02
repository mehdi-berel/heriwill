import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

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
export const heirActions = {
  // Create Heir
  createHeir: async (heirData: HeirData) => {
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
  },

  // Update Heir
  updateHeir: async (heirId: string, updateData: HeirUpdate) => {
    const { data, error } = await supabase
      .from('heirs')
      .update(updateData)
      .eq('id', heirId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Delete Heir
  deleteHeir: async (heirId: string) => {
    const { error } = await supabase
      .from('heirs')
      .delete()
      .eq('id', heirId)

    if (error) throw new Error(error.message)
  },

  // Get Heir by ID
  getHeirById: async (heirId: string) => {
    const { data, error } = await supabase
      .from('heirs')
      .select('*')
      .eq('id', heirId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get All Heirs for User
  getAllHeirs: async (userId: string): Promise<HeirRow[]> => {
    const { data, error } = await supabase
      .from('heirs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Invitation Management
  resendInvitation: async (heirId: string) => {
    const heir = await heirActions.getHeirById(heirId)
    if (!heir) throw new Error('Heir not found')

    // TODO: Implement email sending service
    // await sendInvitationEmail(heir.email_encrypted, heir.invitation_code)
    
    // Update invitation status
    const { data } = await supabase
      .from('heirs')
      .update({ invitation_status: 'pending' })
      .eq('id', heirId)
      .select()
      .single()

    return data
  },

  // Revoke Access
  revokeAccess: async (heirId: string) => {
    const { data } = await supabase
      .from('heirs')
      .update({ invitation_status: 'rejected' })
      .eq('id', heirId)
      .select()
      .single()

    return data
  },

  // Update Verification Status
  updateVerificationStatus: async (heirId: string, status: string) => {
    const { data } = await supabase
      .from('heirs')
      .update({ notification_status: status }) // mapped verification_status to notification_status or similar if needed, check DB
      .eq('id', heirId)
      .select()
      .single()

    return data
  },

  // Get Heir Statistics
  getHeirStats: async (userId: string) => {
    const heirs = await heirActions.getAllHeirs(userId)
    
    const stats = {
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

    return stats
  },

  // Search and Filter
  searchHeirs: async (userId: string, searchTerm: string) => {
    const heirs = await heirActions.getAllHeirs(userId)
    
    const filteredHeirs = heirs.filter((heir: HeirRow) =>
      heir.full_name_encrypted?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      heir.email_encrypted?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      heir.relationship?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filteredHeirs
  },

  // Filter by Status
  getHeirsByStatus: async (userId: string, status: string) => {
    const heirs = await heirActions.getAllHeirs(userId)
    
    return heirs.filter((heir: HeirRow) => heir.invitation_status === status)
  },

  // Filter by Heir Type
  getHeirsByType: async (userId: string, heirType: string) => {
    const heirs = await heirActions.getAllHeirs(userId)
    
    return heirs.filter((heir: HeirRow) => heir.heir_type === heirType)
  }
}

// Helper Functions
function generateInvitationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
