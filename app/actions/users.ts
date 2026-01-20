import { supabase } from '../../lib/supabase'

// User Management Actions
export const userActions = {
  // Get User Profile
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update User Profile
  updateUserProfile: async (userId: string, updateData: any) => {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Last Activity
  updateLastActivity: async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .update({ 
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return data
  },

  // Update Subscription
  updateSubscription: async (userId: string, subscriptionData: any) => {
    const { data } = await supabase
      .from('users')
      .update({
        subscription_tier: subscriptionData.tier,
        subscription_status: subscriptionData.status,
        subscription_expires_at: subscriptionData.expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return data
  },

  // Update Global Trigger Settings
  updateGlobalTrigger: async (userId: string, triggerData: any) => {
    const { data } = await supabase
      .from('users')
      .update({
        global_trigger_method: triggerData.method,
        global_trigger_settings: triggerData.settings,
        global_scheduled_date: triggerData.scheduledDate,
        trusted_contact_email: triggerData.trustedContactEmail,
        trusted_contact_phone: triggerData.trustedContactPhone,
        trusted_contact_heir_id: triggerData.trustedContactHeirId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return data
  },

  // Update Emergency Contact
  updateEmergencyContact: async (userId: string, contactData: any) => {
    const { data } = await supabase
      .from('users')
      .update({
        emergency_contact_email: contactData.email,
        emergency_contact_phone: contactData.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return data
  },

  // Lock/Unlock Account
  toggleAccountLock: async (userId: string, isLocked: boolean) => {
    const { data } = await supabase
      .from('users')
      .update({ 
        account_locked: isLocked,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return data
  },

  // Update Email Verification
  updateEmailVerification: async (userId: string, isVerified: boolean) => {
    const { data } = await supabase
      .from('users')
      .update({ 
        email_verified: isVerified,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return data
  },

  // Update Last Login
  updateLastLogin: async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return data
  },

  // Update Last Reminder Sent
  updateLastReminderSent: async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .update({ 
        last_reminder_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return data
  },

  // Get User Statistics
  getUserStats: async (userId: string) => {
    const { data: user } = await userActions.getUserProfile(userId)
    
    // Get counts from related tables
    const { data: vaults } = await supabase
      .from('vaults')
      .select('count')
      .eq('user_id', userId)

    const { data: heirs } = await supabase
      .from('heirs')
      .select('count')
      .eq('user_id', userId)

    const { data: plans } = await supabase
      .from('inheritance_plans')
      .select('count')
      .eq('user_id', userId)

    const stats = {
      totalVaults: vaults?.length || 0,
      totalHeirs: heirs?.length || 0,
      totalPlans: plans?.length || 0,
      subscriptionTier: user?.subscription_tier || 'free',
      subscriptionStatus: user?.subscription_status || 'inactive',
      isAccountLocked: user?.account_locked || false,
      isEmailVerified: user?.email_verified || false,
      lastActivity: user?.last_activity,
      lastLogin: user?.last_login
    }

    return stats
  }
}

// User Activity Actions
export const userActivityActions = {
  // Log User Activity
  logActivity: async (activityData: any) => {
    const { data, error } = await supabase
      .from('user_activity')
      .insert({
        user_id: activityData.user_id,
        activity_type: activityData.type,
        description: activityData.description,
        ip_address: activityData.ipAddress,
        user_agent: activityData.userAgent,
        metadata: activityData.metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get User Activities
  getUserActivities: async (userId: string, limit: number = 50) => {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return data || []
  },

  // Get Recent Activities
  getRecentActivities: async (userId: string, hours: number = 24) => {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }
}
