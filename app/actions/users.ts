'use server'

import { createServerSupabaseClient, createServiceRoleClient } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'
import { logger } from '../../lib/utils/logger'

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
}

interface EmergencyContactData {
  email?: string
  phone?: string
}

// Get User Profile
export async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Update User Profile
export async function updateUserProfile(userId: string, updateData: UserUpdateData) {
  const supabase = await createServerSupabaseClient()
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
}

// Update Last Activity
export async function updateLastActivity(userId: string) {
  const supabase = await createServerSupabaseClient()
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
}

// Update Subscription
export async function updateSubscription(userId: string, subscriptionData: SubscriptionData) {
  const supabase = await createServerSupabaseClient()
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
}

// Update Global Trigger Settings
export async function updateGlobalTrigger(userId: string, triggerData: TriggerData) {
  const supabase = await createServerSupabaseClient()
  await supabase
    .from('users')
    .update({
      global_trigger_method: triggerData.method,
      global_trigger_settings: triggerData.settings as unknown as Database['public']['Tables']['users']['Update']['global_trigger_settings'],
      global_scheduled_date: triggerData.scheduledDate,
      trusted_contact_heir_id: triggerData.trustedContactHeirId,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  return { id: userId }
}

// Update Emergency Contact
export async function updateEmergencyContact(userId: string, contactData: EmergencyContactData) {
  const supabase = await createServerSupabaseClient()
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
}

// Lock/Unlock Account
export async function toggleAccountLock(userId: string, isLocked: boolean) {
  const supabase = await createServerSupabaseClient()
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
}

// Update Email Verification
export async function updateEmailVerification(userId: string, isVerified: boolean) {
  const supabase = await createServerSupabaseClient()
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
}

// Update Last Login
export async function updateLastLogin(userId: string) {
  const supabase = await createServerSupabaseClient()
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
}

// Update Last Reminder Sent
export async function updateLastReminderSent(userId: string) {
  const supabase = await createServerSupabaseClient()
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
}

// Get Inheritance Status
export async function getInheritanceStatus(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('inheritance_triggered, inheritance_triggered_at, account_deactivation_date')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Get Global Trigger Settings
export async function getGlobalTriggerSettings(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('global_trigger_method, global_trigger_settings, global_scheduled_date, trusted_contact_heir_id, last_activity')
    .eq('id', userId)
    .single()

  if (error) throw new Error(error.message)
  
  return {
    global_trigger_method: data.global_trigger_method,
    global_trigger_settings: data.global_trigger_settings || { inactivity_days: 90 },
    global_scheduled_date: data.global_scheduled_date,
    trusted_contact_heir_id: data.trusted_contact_heir_id,
    last_activity: data.last_activity,
  }
}

// Delete Global Trigger Settings (deactivate)
export async function deleteGlobalTriggerSettings(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('users')
    .update({
      global_trigger_method: null as Database['public']['Tables']['users']['Update']['global_trigger_method'],
      global_trigger_settings: null as Database['public']['Tables']['users']['Update']['global_trigger_settings'],
      global_scheduled_date: null as Database['public']['Tables']['users']['Update']['global_scheduled_date'],
      trusted_contact_heir_id: null as Database['public']['Tables']['users']['Update']['trusted_contact_heir_id'],
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    logger.error('Error deleting global trigger', error, { userId })
    throw new Error(error.message)
  }

  logger.info('Global trigger deleted successfully', { userId })
}

// Get User Subscription Tier
export async function getUserSubscriptionTier(userId: string): Promise<'free' | 'premium' | 'pro'> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return 'free'
    }

    const tier = (data as Record<string, unknown>).subscription_tier as string
    return (tier === 'premium' || tier === 'pro') ? tier : 'free'
  } catch (error) {
    logger.error('Error getting user tier', error, { userId })
    return 'free'
  }
}

// Get Dashboard Stats (counts for vaults, heirs, assets)
export async function getDashboardStats() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const [vaultsResult, heirsResult, assetsResult] = await Promise.all([
    supabase.from('vaults').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('heirs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('assets').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
  ])

  return {
    vaultsCount: vaultsResult.count || 0,
    heirsCount: heirsResult.count || 0,
    assetsCount: assetsResult.count || 0
  }
}

// Get Dashboard Profile
export async function getDashboardProfile() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, avatar_url, subscription_tier, subscription_status, is_active')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Update Login Timestamps (called after successful login)
export async function updateLoginTimestamps() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const now = new Date().toISOString()
  await supabase
    .from('users')
    .update({
      last_activity: now,
      last_login: now,
      updated_at: now
    })
    .eq('id', user.id)
}

// Get User Statistics
export async function getUserStats(userId: string) {
  const supabase = await createServerSupabaseClient()
  const user = await getUserProfile(userId)
  
  // Get counts from related tables
  const [{ data: vaults }, { data: heirs }] = await Promise.all([
    supabase.from('vaults').select('count').eq('user_id', userId),
    supabase.from('heirs').select('count').eq('user_id', userId)
  ])

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

// Delete Account (uses service role for admin.deleteUser)
export async function deleteAccount(confirmationCode: string) {
  if (confirmationCode !== 'DELETE') {
    throw new Error('Invalid confirmation code')
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const userId = user.id
  logger.info('Starting account deletion process', { userId })

  // Execute DB function to delete all user data
  const { error: rpcError } = await supabase.rpc('delete_user_account', {
    user_id_to_delete: userId,
  })

  if (rpcError) {
    logger.error('Error deleting user data', rpcError, { userId })
    throw new Error('Failed to delete account data')
  }

  // Delete auth user via service role client
  const serviceClient = createServiceRoleClient()
  const { error: deleteAuthError } = await serviceClient.auth.admin.deleteUser(userId)

  if (deleteAuthError) {
    logger.error('Error deleting auth user', deleteAuthError, { userId })
    throw new Error('Failed to delete auth account')
  }

  logger.info('Account deleted successfully', { userId })
}

// Sync subscription from RevenueCat
export async function syncSubscription() {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  const { getCustomerInfo, getSubscriptionTier } = await import('@/lib/revenuecat')

  const [customerInfo, tier] = await Promise.all([
    getCustomerInfo(),
    getSubscriptionTier(),
  ])

  if (!customerInfo) {
    throw new Error('Failed to fetch subscription info from RevenueCat')
  }

  const hasActiveSubscription = Object.keys(customerInfo.entitlements).length > 0
  const subscriptionStatus = hasActiveSubscription ? 'active' : 'inactive'

  let expirationDate = null
  const entitlements = customerInfo.entitlements as unknown as Record<string, unknown>
  const entitlementKeys = Object.keys(entitlements)
  if (entitlementKeys.length > 0) {
    const firstEntitlement = entitlements[entitlementKeys[0]] as { expirationDate?: string }
    expirationDate = firstEntitlement.expirationDate || null
  }

  const { error } = await supabase
    .from('users')
    .update({
      subscription_tier: tier,
      subscription_status: subscriptionStatus,
      subscription_expires_at: expirationDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    throw new Error('Failed to update subscription in database')
  }

  logger.info('Subscription synced successfully', { userId: user.id, tier, status: subscriptionStatus })

  return {
    success: true,
    subscription: {
      tier,
      status: subscriptionStatus,
      expiresAt: expirationDate,
    },
  }
}