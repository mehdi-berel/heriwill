import { supabase } from './supabase'

export interface SubscriptionLimits {
  maxVaults: number
  maxHeirs: number
  canAccessProFeatures: boolean
}

export const SUBSCRIPTION_LIMITS: Record<'free' | 'premium' | 'pro', SubscriptionLimits> = {
  free: {
    maxVaults: 1,
    maxHeirs: 1,
    canAccessProFeatures: false,
  },
  premium: {
    maxVaults: Infinity,
    maxHeirs: Infinity,
    canAccessProFeatures: false,
  },
  pro: {
    maxVaults: Infinity,
    maxHeirs: Infinity,
    canAccessProFeatures: true,
  },
}

export async function checkVaultLimit(userId: string): Promise<{ canCreate: boolean; currentCount: number; limit: number; tier: string }> {
  try {
    // Get user's subscription tier
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    const tier = ((userData as { subscription_tier?: string } | null)?.subscription_tier) || 'free'
    const limits = SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free

    // Count user's vaults
    const { data: vaults } = await supabase
      .from('vaults')
      .select('id')
      .eq('user_id', userId)

    const currentCount = vaults?.length || 0
    const canCreate = currentCount < limits.maxVaults

    return {
      canCreate,
      currentCount,
      limit: limits.maxVaults,
      tier,
    }
  } catch (error) {
    console.error('Error checking vault limit:', error)
    return { canCreate: false, currentCount: 0, limit: 1, tier: 'free' }
  }
}

export async function checkHeirLimit(userId: string): Promise<{ canCreate: boolean; currentCount: number; limit: number; tier: string }> {
  try {
    // Get user's subscription tier
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    const tier = ((userData as { subscription_tier?: string } | null)?.subscription_tier) || 'free'
    const limits = SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free

    // Count user's heirs
    const { data: heirs } = await supabase
      .from('heirs')
      .select('id')
      .eq('user_id', userId)

    const currentCount = heirs?.length || 0
    const canCreate = currentCount < limits.maxHeirs

    return {
      canCreate,
      currentCount,
      limit: limits.maxHeirs,
      tier,
    }
  } catch (error) {
    console.error('Error checking heir limit:', error)
    return { canCreate: false, currentCount: 0, limit: 1, tier: 'free' }
  }
}

export function getSubscriptionLimits(tier: 'free' | 'premium' | 'pro'): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free
}
