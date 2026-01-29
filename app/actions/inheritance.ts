import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type PlanRow = Database['public']['Tables']['inheritance_plans']['Row']
type PlanInsert = Database['public']['Tables']['inheritance_plans']['Insert']
type PlanUpdate = Database['public']['Tables']['inheritance_plans']['Update']
type TriggerRow = Database['public']['Tables']['inheritance_triggers']['Row']
type TriggerInsert = Database['public']['Tables']['inheritance_triggers']['Insert']
type TriggerUpdate = Database['public']['Tables']['inheritance_triggers']['Update']

interface InheritancePlanData {
  user_id: string
  title: string
  description?: string
  status?: string
  trigger_method?: string
  trigger_settings?: Record<string, unknown>
}

interface PlanUpdateData {
  [key: string]: unknown
}

interface TriggerData {
  user_id: string
  plan_id: string
  trigger_type: string
  trigger_conditions?: Record<string, unknown>
  is_active?: boolean
}

interface TriggerUpdateData {
  [key: string]: unknown
}

// Inheritance Plan Actions
export const inheritanceActions = {
  // Create Inheritance Plan
  createPlan: async (planData: InheritancePlanData) => {
    const { data, error } = await supabase
      .from('inheritance_plans')
      .insert({
        user_id: planData.user_id,
        title: planData.title,
        description: planData.description,
        status: planData.status || 'draft',
        trigger_method: planData.trigger_method || 'inactivity',
        trigger_settings: planData.trigger_settings || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Inheritance Plan
  updatePlan: async (planId: string, updateData: PlanUpdateData) => {
    const { data, error } = await supabase
      .from('inheritance_plans')
      .update(updateData)
      .eq('id', planId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Delete Inheritance Plan
  deletePlan: async (planId: string) => {
    const { error } = await supabase
      .from('inheritance_plans')
      .delete()
      .eq('id', planId)

    if (error) throw new Error(error.message)
  },

  // Get Plan by ID
  getPlanById: async (planId: string) => {
    const { data, error } = await supabase
      .from('inheritance_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get All Plans for User
  getAllPlans: async (userId: string): Promise<PlanRow[]> => {
    const { data, error } = await supabase
      .from('inheritance_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Update Plan Status
  updatePlanStatus: async (planId: string, status: string) => {
    // Check if status is a valid boolean for is_active, or if it maps to is_active
    // The DB has is_active (boolean) and is_triggered (boolean). No 'status' string column.
    // Assuming status='active' maps to is_active=true
    const isActive = status === 'active'
    
    const { data } = await supabase
      .from('inheritance_plans')
      .update({ is_active: isActive })
      .eq('id', planId)
      .select()
      .single()

    return data
  },

  // Get Plan Statistics
  getPlanStats: async (userId: string) => {
    const plans = await inheritanceActions.getAllPlans(userId)
    
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
    
    const { data, error } = await supabase
      .from('inheritance_triggers')
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
  updateTrigger: async (triggerId: string, updateData: TriggerUpdateData) => {
    const { data, error } = await supabase
      .from('inheritance_triggers')
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
    const { data } = await supabase
      .from('inheritance_triggers')
      .update({ status: status })
      .eq('id', triggerId)
      .select()
      .single()

    return data
  },

  // Verify Trigger
  verifyTrigger: async (triggerId: string, verifiedBy: string) => {
    const { data } = await supabase
      .from('inheritance_triggers')
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
