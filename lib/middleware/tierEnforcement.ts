import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSubscriptionTier } from '@/lib/revenuecat'

/**
 * Subscription Tier Enforcement Middleware
 * 
 * Validates user subscription tier and enforces limits
 */

export interface TierLimits {
  vaults: number // -1 for unlimited
  heirs: number // -1 for unlimited
  storage: number // in bytes
  features: {
    sign_off: boolean
    assets: boolean
    legal: boolean
    notary: boolean
  }
}

export const TIER_LIMITS: Record<'free' | 'premium' | 'pro', TierLimits> = {
  free: {
    vaults: 1,
    heirs: 1,
    storage: 1 * 1024 * 1024 * 1024, // 1GB
    features: {
      sign_off: false,
      assets: false,
      legal: false,
      notary: false
    }
  },
  premium: {
    vaults: -1, // unlimited
    heirs: -1, // unlimited
    storage: 10 * 1024 * 1024 * 1024, // 10GB
    features: {
      sign_off: false,
      assets: false,
      legal: false,
      notary: false
    }
  },
  pro: {
    vaults: -1, // unlimited
    heirs: -1, // unlimited
    storage: 100 * 1024 * 1024 * 1024, // 100GB
    features: {
      sign_off: true,
      assets: true,
      legal: true,
      notary: true
    }
  }
}

/**
 * Get user's subscription tier from database
 */
export async function getUserTier(userId: string): Promise<'free' | 'premium' | 'pro'> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return 'free'
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tier = (data as any).subscription_tier as string
    return (tier === 'premium' || tier === 'pro') ? tier : 'free'
  } catch (error) {
    console.error('Error getting user tier:', error)
    return 'free'
  }
}

/**
 * Check if user can create a vault
 */
export async function canCreateVault(userId: string): Promise<{ allowed: boolean; limit: number; current: number }> {
  const tier = await getUserTier(userId)
  const limits = TIER_LIMITS[tier]

  // Get current vault count
  const { data, error } = await supabase
    .from('vaults')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('Error counting vaults:', error)
    return { allowed: false, limit: limits.vaults, current: 0 }
  }

  const currentCount = data?.length || 0
  const allowed = limits.vaults === -1 || currentCount < limits.vaults

  return {
    allowed,
    limit: limits.vaults,
    current: currentCount
  }
}

/**
 * Check if user can create an heir
 */
export async function canCreateHeir(userId: string): Promise<{ allowed: boolean; limit: number; current: number }> {
  const tier = await getUserTier(userId)
  const limits = TIER_LIMITS[tier]

  // Get current heir count
  const { data, error } = await supabase
    .from('heirs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    console.error('Error counting heirs:', error)
    return { allowed: false, limit: limits.heirs, current: 0 }
  }

  const currentCount = data?.length || 0
  const allowed = limits.heirs === -1 || currentCount < limits.heirs

  return {
    allowed,
    limit: limits.heirs,
    current: currentCount
  }
}

/**
 * Check if user can access a feature
 */
export async function canAccessFeature(
  userId: string,
  feature: 'sign_off' | 'assets' | 'legal' | 'notary'
): Promise<boolean> {
  const tier = await getUserTier(userId)
  const limits = TIER_LIMITS[tier]
  return limits.features[feature]
}

/**
 * Check storage usage and limits
 */
export async function checkStorageLimit(
  userId: string,
  additionalBytes: number = 0
): Promise<{ allowed: boolean; limit: number; current: number; available: number }> {
  const tier = await getUserTier(userId)
  const limits = TIER_LIMITS[tier]

  // Get current storage usage from vault_items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from('vault_items') as any)
    .select('file_size')
    .eq('user_id', userId)

  if (error) {
    console.error('Error calculating storage:', error)
    return {
      allowed: false,
      limit: limits.storage,
      current: 0,
      available: limits.storage
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUsage = (data || []).reduce((sum: number, item: any) => {
    return sum + (item.file_size || 0)
  }, 0)

  const allowed = (currentUsage + additionalBytes) <= limits.storage

  return {
    allowed,
    limit: limits.storage,
    current: currentUsage,
    available: limits.storage - currentUsage
  }
}

/**
 * Middleware to enforce tier limits on API routes
 */
export async function enforceTierLimit(
  request: NextRequest,
  type: 'vault' | 'heir' | 'feature',
  feature?: 'sign_off' | 'assets' | 'legal' | 'notary'
): Promise<NextResponse | null> {
  try {
    // Get user from request
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check limits based on type
    switch (type) {
      case 'vault': {
        const { allowed, limit, current } = await canCreateVault(user.id)
        if (!allowed) {
          return NextResponse.json(
            {
              error: 'Vault limit reached',
              message: `You have reached your vault limit (${current}/${limit}). Upgrade to create more vaults.`,
              limit,
              current,
              upgrade_url: '/upgrade'
            },
            { status: 403 }
          )
        }
        break
      }

      case 'heir': {
        const { allowed, limit, current } = await canCreateHeir(user.id)
        if (!allowed) {
          return NextResponse.json(
            {
              error: 'Heir limit reached',
              message: `You have reached your heir limit (${current}/${limit}). Upgrade to add more heirs.`,
              limit,
              current,
              upgrade_url: '/upgrade'
            },
            { status: 403 }
          )
        }
        break
      }

      case 'feature': {
        if (!feature) {
          return NextResponse.json(
            { error: 'Feature not specified' },
            { status: 400 }
          )
        }
        const allowed = await canAccessFeature(user.id, feature)
        if (!allowed) {
          return NextResponse.json(
            {
              error: 'Feature not available',
              message: `This feature requires a Pro subscription. Upgrade to access ${feature}.`,
              feature,
              upgrade_url: '/upgrade'
            },
            { status: 403 }
          )
        }
        break
      }
    }

    // All checks passed
    return null
  } catch (error) {
    console.error('Error enforcing tier limit:', error)
    return NextResponse.json(
      { error: 'Failed to validate subscription' },
      { status: 500 }
    )
  }
}
