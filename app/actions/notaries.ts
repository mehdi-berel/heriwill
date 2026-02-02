"use server"

import { createServerSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type NotaryRow = Database['public']['Tables']['notaries']['Row']
type NotaryInsert = Database['public']['Tables']['notaries']['Insert']
type NotaryUpdate = Database['public']['Tables']['notaries']['Update']

export const notaryActions = {
  // Create Notary
  createNotary: async (notaryData: NotaryInsert) => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('notaries')
      .insert(notaryData)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Update Notary
  updateNotary: async (notaryId: string, updateData: NotaryUpdate) => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('notaries')
      .update(updateData)
      .eq('id', notaryId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Delete Notary
  deleteNotary: async (notaryId: string) => {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('notaries')
      .delete()
      .eq('id', notaryId)

    if (error) throw new Error(error.message)
  },

  // Get Notary by ID
  getNotaryById: async (notaryId: string): Promise<NotaryRow> => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('notaries')
      .select('*')
      .eq('id', notaryId)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Get All Notaries for User
  getAllNotaries: async (userId: string): Promise<NotaryRow[]> => {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('notaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  // Set Primary Notary
  setPrimaryNotary: async (userId: string, notaryId: string) => {
    const supabase = await createServerSupabaseClient()
    
    // First, unset all primary notaries for this user
    await supabase
      .from('notaries')
      .update({ is_primary: false })
      .eq('user_id', userId)

    // Then set the selected notary as primary
    const { data, error } = await supabase
      .from('notaries')
      .update({ is_primary: true })
      .eq('id', notaryId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }
}
