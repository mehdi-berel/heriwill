import { supabase } from '../../lib/supabase'

// Inheritance Plan Actions
export const inheritanceActions = {
  // Create Inheritance Plan
  createPlan: async (planData: any) => {
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
  updatePlan: async (planId: string, updateData: any) => {
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
  getAllPlans: async (userId: string) => {
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
    const { data } = await supabase
      .from('inheritance_plans')
      .update({ status })
      .eq('id', planId)
      .select()
      .single()

    return data
  },

  // Get Plan Statistics
  getPlanStats: async (userId: string) => {
    const { data: plans } = await inheritanceActions.getAllPlans(userId)
    
    const stats = {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.status === 'active').length,
      draftPlans: plans.filter(p => p.status === 'draft').length,
      completedPlans: plans.filter(p => p.status === 'completed').length,
      recentlyUpdated: plans.filter(p => {
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
  createTrigger: async (triggerData: any) => {
    const { data, error } = await supabase
      .from('inheritance_triggers')
      .insert({
        user_id: triggerData.user_id,
        plan_id: triggerData.plan_id,
        trigger_type: triggerData.trigger_type,
        trigger_conditions: triggerData.trigger_conditions || {},
        is_active: triggerData.is_active || true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Trigger
  updateTrigger: async (triggerId: string, updateData: any) => {
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
  getTriggersForPlan: async (planId: string) => {
    const { data, error } = await supabase
      .from('inheritance_triggers')
      .select('*')
      .eq('plan_id', planId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Activate/Deactivate Trigger
  toggleTrigger: async (triggerId: string, isActive: boolean) => {
    const { data } = await supabase
      .from('inheritance_triggers')
      .update({ is_active: isActive })
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
        verified: true,
        verified_by: verifiedBy,
        verified_at: new Date().toISOString()
      })
      .eq('id', triggerId)
      .select()
      .single()

    return data
  }
}
