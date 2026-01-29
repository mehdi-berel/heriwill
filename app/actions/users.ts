import { supabase } from '../../lib/supabase'

// Removed unused type definitions

interface UserUpdateData {
  [key: string]: unknown
}

interface SubscriptionData {
  tier: string
  status: string
  expiresAt: string
}

interface TriggerData {
  method: string
  settings?: Record<string, unknown>
  scheduledDate?: string
  trustedContactHeirId?: string
  trustedContactEmail?: string
  trustedContactPhone?: string
}

interface EmergencyContactData {
  email?: string
  phone?: string
}

interface ActivityData {
  user_id: string
  type: string
  description?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}

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
  updateUserProfile: async (userId: string, updateData: UserUpdateData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('users') as any)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('users') as any)
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
  updateSubscription: async (userId: string, subscriptionData: SubscriptionData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('users') as any)
      .update({
        subscription_tier: subscriptionData.tier as string,
        subscription_status: subscriptionData.status as string,
        subscription_expires_at: subscriptionData.expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return data
  },

  // Update Global Trigger Settings
  updateGlobalTrigger: async (userId: string, triggerData: TriggerData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('users') as any)
      .update({
        global_trigger_method: triggerData.method as string,
        global_trigger_settings: triggerData.settings as Record<string, unknown>,
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
  updateEmergencyContact: async (userId: string, contactData: EmergencyContactData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('users') as any)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('users') as any)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('users') as any)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('users') as any)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('users') as any)
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

    const userData = user as Record<string, unknown>
    const stats = {
      totalVaults: vaults?.length || 0,
      totalHeirs: heirs?.length || 0,
      totalPlans: plans?.length || 0,
      subscriptionTier: userData?.subscription_tier || 'free',
      subscriptionStatus: userData?.subscription_status || 'inactive',
      isAccountLocked: userData?.account_locked || false,
      isEmailVerified: userData?.email_verified || false,
      lastActivity: userData?.last_activity,
      lastLogin: userData?.last_login
    }

    return stats
  }
}

// User Activity Actions
export const userActivityActions = {
  // Log User Activity
  logActivity: async (activityData: ActivityData) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('user_activity') as any)
      .insert({
        user_id: activityData.user_id,
        activity_type: activityData.type,
        // description: activityData.description, // Not in schema based on MCP, check if needed or add to metadata
        ip_address: activityData.ipAddress,
        user_agent: activityData.userAgent,
        metadata: {
          ...activityData.metadata,
          description: activityData.description
        },
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
