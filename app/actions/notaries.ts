"use server"

import { createServerSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type NotaryRow = Database['public']['Tables']['notaries']['Row']
type NotaryInsert = Database['public']['Tables']['notaries']['Insert']
type NotaryUpdate = Database['public']['Tables']['notaries']['Update']

// Create Notary
export async function createNotary(notaryData: NotaryInsert) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  // Verify user is creating notary for themselves
  if (notaryData.user_id !== user.id) throw new Error('Unauthorized: Cannot create notary for another user')

  const { data, error } = await supabase
    .from('notaries')
    .insert({ ...notaryData, user_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Update Notary
export async function updateNotary(notaryId: string, updateData: NotaryUpdate) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: existingNotary, error: fetchError } = await supabase
    .from('notaries')
    .select('user_id')
    .eq('id', notaryId)
    .single()
  if (fetchError || !existingNotary) throw new Error('Notary not found')
  if (existingNotary.user_id !== user.id) throw new Error('Unauthorized: You do not own this notary')

  const { data, error } = await supabase
    .from('notaries')
    .update(updateData)
    .eq('id', notaryId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Delete Notary
export async function deleteNotary(notaryId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  // Verify ownership
  const { data: existingNotary, error: fetchError } = await supabase
    .from('notaries')
    .select('user_id')
    .eq('id', notaryId)
    .single()
  if (fetchError || !existingNotary) throw new Error('Notary not found')
  if (existingNotary.user_id !== user.id) throw new Error('Unauthorized: You do not own this notary')

  const { error } = await supabase
    .from('notaries')
    .delete()
    .eq('id', notaryId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
}

// Get Notary by ID
export async function getNotaryById(notaryId: string): Promise<NotaryRow> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('notaries')
    .select('*')
    .eq('id', notaryId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Get All Notaries for User
export async function getAllNotaries(userId: string, page = 1, pageSize = 50): Promise<{ data: NotaryRow[]; total: number; page: number; pageSize: number }> {
  const supabase = await createServerSupabaseClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('notaries')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(error.message)
  return { data: data || [], total: count ?? 0, page, pageSize }
}

// Set Primary Notary
export async function setPrimaryNotary(userId: string, notaryId: string) {
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
