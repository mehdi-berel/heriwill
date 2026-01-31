import { supabase } from './supabase'

export interface SubscriptionLimits {
  maxVaults: number
  maxHeirs: number
  maxStorageGB: number
  canAccessProFeatures: boolean
}

export const SUBSCRIPTION_LIMITS: Record<'free' | 'premium' | 'pro', SubscriptionLimits> = {
  free: {
    maxVaults: 1,
    maxHeirs: 1,
    maxStorageGB: 1,
    canAccessProFeatures: false,
  },
  premium: {
    maxVaults: Infinity,
    maxHeirs: Infinity,
    maxStorageGB: 10,
    canAccessProFeatures: false,
  },
  pro: {
    maxVaults: Infinity,
    maxHeirs: Infinity,
    maxStorageGB: 100,
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

export async function checkStorageLimit(userId: string, additionalSizeBytes: number = 0): Promise<{ 
  canUpload: boolean
  currentUsageGB: number
  limitGB: number
  tier: string
  remainingGB: number
}> {
  try {
    // Get user's subscription tier
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    const tier = ((userData as { subscription_tier?: string } | null)?.subscription_tier) || 'free'
    const limits = SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free

    // Get all user's vaults to calculate total storage
    const { data: vaults } = await supabase
      .from('vaults')
      .select('vault_data')
      .eq('user_id', userId)

    // Calculate current storage usage
    let totalBytes = 0
    if (vaults) {
      for (const vault of vaults) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vaultData = (vault as any).vault_data as { size?: number } | null
        if (vaultData?.size) {
          totalBytes += vaultData.size
        }
      }
    }

    const currentUsageGB = totalBytes / (1024 * 1024 * 1024)
    const additionalGB = additionalSizeBytes / (1024 * 1024 * 1024)
    const totalUsageGB = currentUsageGB + additionalGB
    const limitGB = limits.maxStorageGB
    const remainingGB = Math.max(0, limitGB - currentUsageGB)
    const canUpload = totalUsageGB <= limitGB

    return {
      canUpload,
      currentUsageGB: Math.round(currentUsageGB * 100) / 100,
      limitGB,
      tier,
      remainingGB: Math.round(remainingGB * 100) / 100,
    }
  } catch (error) {
    console.error('Error checking storage limit:', error)
    return { 
      canUpload: false, 
      currentUsageGB: 0, 
      limitGB: 1, 
      tier: 'free',
      remainingGB: 0,
    }
  }
}

export function getSubscriptionLimits(tier: 'free' | 'premium' | 'pro'): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free
}
