/**
 * @deprecated This file is OBSOLETE and should not be used.
 * The inheritance_plans table has been removed from the database.
 * Inheritance logic is now handled via users.global_trigger_* fields.
 * 
 * Use these instead:
 * - /lib/services/globalTriggerService.ts for trigger management
 * - /api/trigger-inheritance for manual triggering
 * - users table for inheritance configuration
 * 
 * TODO: Remove this file after confirming no active usage
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import type { Database } from '../../lib/database.types'

type TriggerRow = Database['public']['Tables']['inheritance_triggers']['Row']
type TriggerUpdate = Database['public']['Tables']['inheritance_triggers']['Update']

// Temporary type for deprecated code - inheritance_plans table no longer exists
type PlanRow = {
  id: string
  user_id: string
  is_active: boolean
  is_triggered: boolean
  updated_at: string
  [key: string]: unknown
}

interface TriggerData {
  user_id: string
  plan_id: string
  trigger_type: string
  trigger_conditions?: Record<string, unknown>
  is_active?: boolean
}

// Inheritance Plan Actions
export const inheritanceActions = {
  // Create Inheritance Plan
  // @deprecated - inheritance_plans table no longer exists
  createPlan: async () => {
    logger.warn('createPlan is deprecated - use globalTriggerService')
    return null
    // const { data, error } = await (supabase.from('inheritance_plans') as any)
    //   .insert({
    //     user_id: planData.user_id,
    //     plan_name: planData.plan_name,
    //     plan_type: planData.plan_type || 'standard',
    //     instructions_encrypted: planData.instructions_encrypted || null
    //   })
    //   .select()
    //   .single()

    // if (error) throw new Error(error.message)
    // return data
  },

  // Update Inheritance Plan
  // @deprecated - inheritance_plans table no longer exists
  updatePlan: async () => {
    logger.warn('updatePlan is deprecated - use globalTriggerService')
    return null
    // const { data, error } = await (supabase.from('inheritance_plans') as any)
    //   .update(updateData)
    //   .eq('id', planId)
    //   .select()
    //   .single()

    // if (error) throw new Error(error.message)
    // return data
  },

  // Delete Inheritance Plan
  // @deprecated - inheritance_plans table no longer exists
  deletePlan: async () => {
    logger.warn('deletePlan is deprecated - use globalTriggerService')
    return null
    // const { error } = await supabase
    //   .from('inheritance_plans')
    //   .delete()
    //   .eq('id', planId)

    // if (error) throw new Error(error.message)
  },

  // Get Plan by ID
  // @deprecated - inheritance_plans table no longer exists
  getPlanById: async () => {
    logger.warn('getPlanById is deprecated - use globalTriggerService')
    return null
    // const { data, error } = await supabase
    //   .from('inheritance_plans')
    //   .select('*')
    //   .eq('id', planId)
    //   .single()

    // if (error) throw new Error(error.message)
    // return data
  },

  // Get All Plans for User
  // @deprecated - inheritance_plans table no longer exists
  getAllPlans: async (): Promise<PlanRow[]> => {
    logger.warn('getAllPlans is deprecated - use globalTriggerService')
    return []
    // const { data, error } = await supabase
    //   .from('inheritance_plans')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false })

    // if (error) throw new Error(error.message)
    // return data || []
  },

  // Update Plan Status
  // @deprecated - inheritance_plans table no longer exists
  updatePlanStatus: async () => {
    // This function is obsolete - inheritance_plans table removed
    // Use globalTriggerService instead
    logger.warn('updatePlanStatus is deprecated - use globalTriggerService')
    return null
    // const { data } = await (supabase.from('inheritance_plans') as any)
    //   .update({ is_active: isActive })
    //   .eq('id', planId)
    //   .select()
    //   .single()

    // return data
  },

  // Get Plan Statistics
  getPlanStats: async () => {
    const plans = await inheritanceActions.getAllPlans()
    
    const stats = {
      totalPlans: plans.length,
      activePlans: plans.filter((p: PlanRow) => p.is_active).length,
      draftPlans: plans.filter((p: PlanRow) => !p.is_active).length,
      completedPlans: plans.filter((p: PlanRow) => p.is_triggered).length,
      recentlyUpdated: plans.filter((p: PlanRow) => {
        return p.updated_at && 
          new Date(p.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }).length
    }

    return stats
  }
}

// Inheritance Trigger Actions
export const triggerActions = {
  // Create Trigger
  createTrigger: async (triggerData: TriggerData) => {
    // Inheritance triggers in DB: id, inheritance_plan_id, user_id, trigger_metadata, status, requires_verification...
    // trigger_type is not in DB, maybe trigger_reason or part of metadata?
    // Using trigger_metadata for conditions
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('inheritance_triggers') as any)
      .insert({
        user_id: triggerData.user_id,
        inheritance_plan_id: triggerData.plan_id,
        trigger_metadata: { 
          type: triggerData.trigger_type, 
          conditions: triggerData.trigger_conditions 
        },
        status: 'pending',
        requires_verification: true,
        triggered_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Trigger
  updateTrigger: async (triggerId: string, updateData: TriggerUpdate) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('inheritance_triggers') as any)
      .update(updateData)
      .eq('id', triggerId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get Triggers for Plan
  getTriggersForPlan: async (planId: string): Promise<TriggerRow[]> => {
    const { data, error } = await supabase
      .from('inheritance_triggers')
      .select('*')
      .eq('inheritance_plan_id', planId)
      .order('triggered_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Activate/Deactivate Trigger
  toggleTrigger: async (triggerId: string, isActive: boolean) => {
    const status = isActive ? 'pending' : 'cancelled'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('inheritance_triggers') as any)
      .update({ status: status })
      .eq('id', triggerId)
      .select()
      .single()

    return data
  },

  // Verify Trigger
  verifyTrigger: async (triggerId: string, verifiedBy: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('inheritance_triggers') as any)
      .update({ 
        // verified: true, // DB column not found in schema analysis? 
        // Schema has: verified_at, verified_by, requires_verification (bool)
        // Setting verified_at implies verified
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
        status: 'verified'
      })
      .eq('id', triggerId)
      .select()
      .single()

    return data
  }
}
