-- Migration: Fix Schema Inconsistencies
-- Date: 2026-02-02
-- Description: Add missing fields and tables to match code expectations

-- 1. Add missing inheritance_triggered fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS inheritance_triggered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS inheritance_triggered_at timestamp with time zone;

-- 2. Create user_wills table for will management
CREATE TABLE IF NOT EXISTS public.user_wills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  executor_name text,
  executor_email text,
  executor_phone text,
  executor_relationship text,
  backup_executor_name text,
  backup_executor_email text,
  backup_executor_phone text,
  funeral_wishes text,
  burial_cremation_preference text,
  specific_bequests jsonb DEFAULT '[]'::jsonb,
  residuary_beneficiaries jsonb DEFAULT '[]'::jsonb,
  guardianship_minors text,
  pet_care_instructions text,
  digital_assets_instructions text,
  special_instructions text,
  witnesses jsonb DEFAULT '[]'::jsonb,
  notary_info jsonb,
  last_updated timestamp with time zone DEFAULT now(),
  is_complete boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_wills_pkey PRIMARY KEY (id),
  CONSTRAINT user_wills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_wills_user_id_unique UNIQUE (user_id)
);

-- 3. Create user_wishes table for personal wishes
CREATE TABLE IF NOT EXISTS public.user_wishes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['funeral'::text, 'memorial'::text, 'personal'::text, 'family'::text, 'other'::text])),
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  is_private boolean DEFAULT false,
  share_with_heirs boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_wishes_pkey PRIMARY KEY (id),
  CONSTRAINT user_wishes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_wills_user_id ON public.user_wills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishes_user_id ON public.user_wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishes_category ON public.user_wishes(category);
CREATE INDEX IF NOT EXISTS idx_users_inheritance_triggered ON public.users(inheritance_triggered) WHERE inheritance_triggered = true;

-- 5. Add RLS policies for user_wills
ALTER TABLE public.user_wills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wills"
  ON public.user_wills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wills"
  ON public.user_wills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wills"
  ON public.user_wills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wills"
  ON public.user_wills FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Add RLS policies for user_wishes
ALTER TABLE public.user_wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishes"
  ON public.user_wishes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishes"
  ON public.user_wishes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishes"
  ON public.user_wishes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishes"
  ON public.user_wishes FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Add comments for documentation
COMMENT ON TABLE public.user_wills IS 'Stores user will information and executor details';
COMMENT ON TABLE public.user_wishes IS 'Stores user personal wishes and instructions for heirs';
COMMENT ON COLUMN public.users.inheritance_triggered IS 'Indicates if inheritance plan has been triggered for this user';
COMMENT ON COLUMN public.users.inheritance_triggered_at IS 'Timestamp when inheritance was triggered';
