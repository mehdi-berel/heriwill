-- Migration: Add In-App Notifications and Fix Legal Document Structure
-- Date: 2026-02-02
-- Description: Create notifications system and restructure legal table for templates

-- 1. Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY[
    'heir_invitation'::text,
    'inheritance_triggered'::text,
    'vault_shared'::text,
    'false_alarm'::text,
    'heir_accepted'::text,
    'heir_rejected'::text,
    'subscription_update'::text,
    'system_alert'::text
  ])),
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  action_label text,
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  priority text DEFAULT 'normal'::text CHECK (priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone,
  archived_at timestamp with time zone,
  expires_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 2. Restructure legal table to store TEMPLATES ONLY
-- Drop existing legal table and recreate with proper structure
DROP TABLE IF EXISTS public.legal CASCADE;

CREATE TABLE public.legal (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  document_type text NOT NULL CHECK (document_type = ANY (ARRAY[
    'will'::text,
    'trust'::text,
    'power_of_attorney'::text,
    'healthcare_directive'::text,
    'living_will'::text,
    'deed'::text,
    'contract'::text,
    'other'::text
  ])),
  description text,
  template_content text,
  template_fields jsonb DEFAULT '[]'::jsonb,
  category text,
  is_system_template boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT legal_pkey PRIMARY KEY (id),
  CONSTRAINT legal_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- 3. Ensure vault_items has 'legal' type in enum
-- This should already exist based on database.types.ts, but ensure it's there
-- The vault_item_type enum should include: password, document, video, image, note, crypto, bank, other, legal, assets

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_legal_document_type ON public.legal(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_is_active ON public.legal(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_legal_is_system_template ON public.legal(is_system_template) WHERE is_system_template = true;

-- 5. Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert notifications for any user (service role)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- 6. Add RLS policies for legal templates
ALTER TABLE public.legal ENABLE ROW LEVEL SECURITY;

-- Everyone can view active system templates
CREATE POLICY "Users can view active system templates"
  ON public.legal FOR SELECT
  USING (is_system_template = true AND is_active = true);

-- Users can view their own custom templates
CREATE POLICY "Users can view their own templates"
  ON public.legal FOR SELECT
  USING (auth.uid() = created_by);

-- Users can create their own templates
CREATE POLICY "Users can create their own templates"
  ON public.legal FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_system_template = false);

-- Users can update their own templates
CREATE POLICY "Users can update their own templates"
  ON public.legal FOR UPDATE
  USING (auth.uid() = created_by AND is_system_template = false);

-- Users can delete their own templates
CREATE POLICY "Users can delete their own templates"
  ON public.legal FOR DELETE
  USING (auth.uid() = created_by AND is_system_template = false);

-- 7. Insert default system templates
INSERT INTO public.legal (name, document_type, description, is_system_template, template_content, template_fields) VALUES
(
  'Basic Will Template',
  'will',
  'A simple will template for distributing assets and naming executors',
  true,
  'LAST WILL AND TESTAMENT\n\nI, {{full_name}}, of {{address}}, being of sound mind, do hereby declare this to be my Last Will and Testament.\n\n1. EXECUTOR\nI appoint {{executor_name}} as the Executor of this Will.\n\n2. BENEFICIARIES\n{{beneficiaries}}\n\n3. RESIDUARY ESTATE\n{{residuary_clause}}\n\nSigned: ________________\nDate: {{date}}\n\nWitnesses:\n________________\n________________',
  '[{"name": "full_name", "type": "text", "required": true}, {"name": "address", "type": "text", "required": true}, {"name": "executor_name", "type": "text", "required": true}, {"name": "beneficiaries", "type": "textarea", "required": true}, {"name": "residuary_clause", "type": "textarea", "required": true}]'::jsonb
),
(
  'Power of Attorney Template',
  'power_of_attorney',
  'Grant someone authority to act on your behalf',
  true,
  'POWER OF ATTORNEY\n\nI, {{principal_name}}, hereby appoint {{agent_name}} as my attorney-in-fact to act on my behalf.\n\nPowers granted:\n{{powers_list}}\n\nThis Power of Attorney shall {{duration}}.\n\nSigned: ________________\nDate: {{date}}',
  '[{"name": "principal_name", "type": "text", "required": true}, {"name": "agent_name", "type": "text", "required": true}, {"name": "powers_list", "type": "textarea", "required": true}, {"name": "duration", "type": "text", "required": true}]'::jsonb
),
(
  'Healthcare Directive Template',
  'healthcare_directive',
  'Document your healthcare wishes and appoint a healthcare proxy',
  true,
  'ADVANCE HEALTHCARE DIRECTIVE\n\nI, {{full_name}}, being of sound mind, make this Advance Healthcare Directive.\n\n1. HEALTHCARE AGENT\nI appoint {{agent_name}} as my healthcare agent.\n\n2. HEALTHCARE WISHES\n{{healthcare_wishes}}\n\n3. END-OF-LIFE DECISIONS\n{{end_of_life_preferences}}\n\nSigned: ________________\nDate: {{date}}',
  '[{"name": "full_name", "type": "text", "required": true}, {"name": "agent_name", "type": "text", "required": true}, {"name": "healthcare_wishes", "type": "textarea", "required": true}, {"name": "end_of_life_preferences", "type": "textarea", "required": true}]'::jsonb
);

-- 8. Add comments for documentation
COMMENT ON TABLE public.notifications IS 'In-app notifications for users (heir invitations, inheritance triggers, etc.)';
COMMENT ON TABLE public.legal IS 'Legal document templates (system and user-created). Completed documents are stored as vault_items with type=legal';
COMMENT ON COLUMN public.legal.template_content IS 'Template text with {{field}} placeholders';
COMMENT ON COLUMN public.legal.template_fields IS 'JSON array of field definitions for the template';
COMMENT ON COLUMN public.legal.is_system_template IS 'True for built-in templates, false for user-created templates';

-- 9. Create function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_action_url text DEFAULT NULL,
  p_action_label text DEFAULT NULL,
  p_priority text DEFAULT 'normal',
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    action_label,
    priority,
    metadata
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    p_action_label,
    p_priority,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create function to archive notification
CREATE OR REPLACE FUNCTION public.archive_notification(p_notification_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET is_archived = true, archived_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
