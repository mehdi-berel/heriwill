import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

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
    await supabase
      .from('users')
      .update({
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { id: userId }
  },

  // Update Subscription
  updateSubscription: async (userId: string, subscriptionData: SubscriptionData) => {
    await supabase
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

    return { id: userId }
  },

  // Update Global Trigger Settings
  updateGlobalTrigger: async (userId: string, triggerData: TriggerData) => {
    await supabase
      .from('users')
      .update({
        global_trigger_method: triggerData.method,
        global_trigger_settings: triggerData.settings as unknown as Database['public']['Tables']['users']['Update']['global_trigger_settings'],
        global_scheduled_date: triggerData.scheduledDate,
        trusted_contact_email: triggerData.trustedContactEmail,
        trusted_contact_phone: triggerData.trustedContactPhone,
        trusted_contact_heir_id: triggerData.trustedContactHeirId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { id: userId }
  },

  // Update Emergency Contact
  updateEmergencyContact: async (userId: string, contactData: EmergencyContactData) => {
    await supabase
      .from('users')
      .update({
        emergency_contact_email: contactData.email,
        emergency_contact_phone: contactData.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { id: userId }
  },

  // Lock/Unlock Account
  toggleAccountLock: async (userId: string, isLocked: boolean) => {
    await supabase
      .from('users')
      .update({
        account_locked: isLocked,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { id: userId }
  },

  // Update Email Verification
  updateEmailVerification: async (userId: string, isVerified: boolean) => {
    await supabase
      .from('users')
      .update({
        email_verified: isVerified,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { id: userId }
  },

  // Update Last Login
  updateLastLogin: async (userId: string) => {
    await supabase
      .from('users')
      .update({
        last_login: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { id: userId }
  },

  // Update Last Reminder Sent
  updateLastReminderSent: async (userId: string) => {
    await supabase
      .from('users')
      .update({
        last_reminder_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { id: userId }
  },

  // Get Inheritance Status
  getInheritanceStatus: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('inheritance_triggered, inheritance_triggered_at, account_deactivation_date')
      .eq('id', userId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get User Statistics
  getUserStats: async (userId: string) => {
    const user = await userActions.getUserProfile(userId)
    
    // Get counts from related tables
    const { data: vaults } = await supabase
      .from('vaults')
      .select('count')
      .eq('user_id', userId)

    const { data: heirs } = await supabase
      .from('heirs')
      .select('count')
      .eq('user_id', userId)

    const userData = user as Record<string, unknown>
    const stats = {
      totalVaults: vaults?.length || 0,
      totalHeirs: heirs?.length || 0,
      subscriptionTier: userData?.subscription_tier || 'free',
      subscriptionStatus: userData?.subscription_status || 'inactive',
      isAccountLocked: userData?.account_locked || false,
      isEmailVerified: userData?.email_verified || false,
      lastActivity: userData?.last_activity,
      lastLogin: userData?.last_login,
      inheritanceTriggered: userData?.inheritance_triggered || false,
      inheritanceTriggeredAt: userData?.inheritance_triggered_at,
      accountDeactivationDate: userData?.account_deactivation_date
    }

    return stats
  }
}