"use server"

import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/utils/logger'
import { Database } from '@/lib/database.types'

type LegalTemplate = Database['public']['Tables']['legal']['Row']
type LegalTemplateInsert = Database['public']['Tables']['legal']['Insert']

/**
 * Get all active legal templates (system and user-created)
 */
export async function getLegalTemplates(): Promise<LegalTemplate[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const query = supabase
      .from('legal')
      .select('*')
      .eq('is_active', true)
      .order('is_system_template', { ascending: false })
      .order('name')

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching legal templates', error)
      return []
    }

    return (data || []) as LegalTemplate[]
  } catch (error) {
    logger.error('Error fetching legal templates', error)
    return []
  }
}

/**
 * Get a specific legal template by ID
 */
export async function getLegalTemplate(templateId: string): Promise<LegalTemplate | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('legal')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) {
      logger.error('Error fetching legal template', error, { templateId })
      return null
    }

    return data as LegalTemplate
  } catch (error) {
    logger.error('Error fetching legal template', error, { templateId })
    return null
  }
}

/**
 * Create a custom legal template (user-created)
 */
export async function createLegalTemplate(
  userId: string,
  templateData: {
    name: string
    document_type: string
    description?: string
    template_content: string
    template_fields?: Array<{ name: string; type: string; required: boolean }>
    category?: string
  }
): Promise<LegalTemplate | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')
    if (userId !== user.id) throw new Error('Unauthorized: Cannot create template for another user')

    const { data, error } = await supabase
      .from('legal')
      .insert({
        name: templateData.name,
        document_type: templateData.document_type,
        description: templateData.description,
        template_content: templateData.template_content,
        template_fields: templateData.template_fields || [],
        category: templateData.category,
        is_system_template: false,
        created_by: userId,
        is_active: true
      } as LegalTemplateInsert)
      .select()
      .single()

    if (error) {
      logger.error('Error creating legal template', error, { userId })
      return null
    }

    logger.info('Legal template created', { templateId: data.id, userId })
    return data as LegalTemplate
  } catch (error) {
    logger.error('Error creating legal template', error, { userId })
    return null
  }
}

/**
 * Fill a legal template with user data and create a vault item
 * This is the workflow: Template -> Filled Document -> Vault Item (type: legal)
 */
export async function createLegalDocumentFromTemplate(
  userId: string,
  vaultId: string,
  templateId: string,
  fieldValues: Record<string, string>,
  documentTitle: string
): Promise<{ vaultItemId: string | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')
    if (userId !== user.id) throw new Error('Unauthorized: Cannot create document for another user')

    // 1. Get the template
    const template = await getLegalTemplate(templateId)
    if (!template) {
      return { vaultItemId: null, error: 'Template not found' }
    }

    // 2. Fill the template with field values
    const filledContent = (template as unknown as { template_content?: string }).template_content || ''
    let processedContent = filledContent
    Object.entries(fieldValues).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      processedContent = processedContent.replace(regex, value)
    })

    // 3. Create a vault item with type 'legal'
    const storagePath = `${userId}/${vaultId}/legal/${Date.now()}-${documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
    
    const { data: vaultItem, error: vaultError } = await supabase
      .from('vault_items')
      .insert({
        user_id: userId,
        vault_id: vaultId,
        item_type: 'legal',
        title_encrypted: documentTitle,
        storage_path: storagePath,
        storage_bucket: 'vault-files',
        metadata: {
          template_id: templateId,
          template_name: template.name,
          document_type: template.document_type,
          filled_content: processedContent,
          field_values: fieldValues,
          created_from_template: true
        }
      })
      .select()
      .single()

    if (vaultError) {
      logger.error('Error creating legal vault item', vaultError, { userId, vaultId, templateId })
      return { vaultItemId: null, error: 'Failed to create legal document' }
    }

    logger.info('Legal document created from template', { 
      vaultItemId: vaultItem.id, 
      templateId, 
      userId, 
      vaultId 
    })

    return { vaultItemId: vaultItem.id }
  } catch (error) {
    logger.error('Error creating legal document from template', error, { userId, vaultId, templateId })
    return { vaultItemId: null, error: 'An error occurred' }
  }
}

/**
 * Update a legal template (user-created only)
 */
export async function updateLegalTemplate(
  templateId: string,
  userId: string,
  updates: Partial<LegalTemplateInsert>
): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')
    if (userId !== user.id) throw new Error('Unauthorized: Cannot update template for another user')

    const { error } = await supabase
      .from('legal')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .eq('created_by', userId)
      .eq('is_system_template', false)

    if (error) {
      logger.error('Error updating legal template', error, { templateId, userId })
      return false
    }

    logger.info('Legal template updated', { templateId, userId })
    return true
  } catch (error) {
    logger.error('Error updating legal template', error, { templateId, userId })
    return false
  }
}

/**
 * Delete a legal template (user-created only)
 */
export async function deleteLegalTemplate(templateId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Not authenticated')
    if (userId !== user.id) throw new Error('Unauthorized: Cannot delete template for another user')

    const { error } = await supabase
      .from('legal')
      .delete()
      .eq('id', templateId)
      .eq('created_by', userId)
      .eq('is_system_template', false)

    if (error) {
      logger.error('Error deleting legal template', error, { templateId, userId })
      return false
    }

    logger.info('Legal template deleted', { templateId, userId })
    return true
  } catch (error) {
    logger.error('Error deleting legal template', error, { templateId, userId })
    return false
  }
}

/**
 * Get legal documents (vault items with type 'legal') for a user
 */
export async function getUserLegalDocuments(
  userId: string,
  vaultId?: string,
  page = 1,
  pageSize = 50
): Promise<{ data: Array<Database['public']['Tables']['vault_items']['Row']>; total: number; page: number; pageSize: number }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { data: [], total: 0, page, pageSize }
    if (userId !== user.id) return { data: [], total: 0, page, pageSize }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('vault_items')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('item_type', 'legal')
      .order('created_at', { ascending: false })

    if (vaultId) {
      query = query.eq('vault_id', vaultId)
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      logger.error('Error fetching legal documents', error, { userId, vaultId })
      return { data: [], total: 0, page, pageSize }
    }

    return { data: data || [], total: count ?? 0, page, pageSize }
  } catch (error) {
    logger.error('Error fetching legal documents', error, { userId, vaultId })
    return { data: [], total: 0, page, pageSize }
  }
}
