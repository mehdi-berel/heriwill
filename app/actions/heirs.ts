import { supabase } from '../../lib/supabase'

// Heir Management Actions
export const heirActions = {
  // Create Heir
  createHeir: async (heirData: any) => {
    const { data, error } = await supabase
      .from('heirs')
      .insert({
        user_id: heirData.user_id,
        full_name: heirData.full_name,
        email: heirData.email,
        phone: heirData.phone,
        relationship: heirData.relationship,
        access_level: heirData.access_level || 'view',
        verification_method: heirData.verification_method || 'email',
        invitation_status: 'pending',
        invitation_code: generateInvitationCode(),
        notification_preferences: heirData.notification_preferences || {
          email: true,
          sms: false,
          in_app: true
        },
        backup_contact: heirData.backup_contact || null,
        special_instructions: heirData.special_instructions || '',
        invited_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Heir
  updateHeir: async (heirId: string, updateData: any) => {
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
  getAllHeirs: async (userId: string) => {
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

    // In a real app, this would send an email
    console.log('Resending invitation to heir:', heir.email)
    
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
      .update({ verification_status: status })
      .eq('id', heirId)
      .select()
      .single()

    return data
  },

  // Get Heir Statistics
  getHeirStats: async (userId: string) => {
    const { data: heirs } = await heirActions.getAllHeirs(userId)
    
    const stats = {
      totalHeirs: heirs.length,
      acceptedHeirs: heirs.filter(h => h.invitation_status === 'accepted').length,
      pendingHeirs: heirs.filter(h => h.invitation_status === 'pending').length,
      rejectedHeirs: heirs.filter(h => h.invitation_status === 'rejected').length,
      expiredHeirs: heirs.filter(h => {
        return h.invitation_expires_at && new Date(h.invitation_expires_at) < new Date()
      }).length,
      verifiedHeirs: heirs.filter(h => h.verification_status === 'verified').length,
      fullAccessHeirs: heirs.filter(h => h.access_level === 'full').length,
      partialAccessHeirs: heirs.filter(h => h.access_level === 'partial').length,
      viewAccessHeirs: heirs.filter(h => h.access_level === 'view').length,
      recentlyActive: heirs.filter(h => {
        return h.last_activity && 
          new Date(h.last_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }).length
    }

    return stats
  },

  // Search and Filter
  searchHeirs: async (userId: string, searchTerm: string) => {
    const { data: heirs } = await heirActions.getAllHeirs(userId)
    
    const filteredHeirs = heirs.filter(heir =>
      heir.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      heir.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      heir.relationship?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filteredHeirs
  },

  // Filter by Status
  getHeirsByStatus: async (userId: string, status: string) => {
    const { data: heirs } = await heirActions.getAllHeirs(userId)
    
    return heirs.filter(heir => heir.invitation_status === status)
  },

  // Filter by Access Level
  getHeirsByAccessLevel: async (userId: string, accessLevel: string) => {
    const { data: heirs } = await heirActions.getAllHeirs(userId)
    
    return heirs.filter(heir => heir.access_level === accessLevel)
  }
}

// Helper Functions
function generateInvitationCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
