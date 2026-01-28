-- Migration: Create notaries and user_wills tables
-- Date: 2026-01-28

-- Create notaries table
CREATE TABLE IF NOT EXISTS public.notaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  firm_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  license_number TEXT,
  specialization TEXT,
  notes TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_notaries_user_id ON public.notaries(user_id);

-- Create index on is_primary for faster primary notary lookups
CREATE INDEX IF NOT EXISTS idx_notaries_is_primary ON public.notaries(user_id, is_primary);

-- Create user_wills table
CREATE TABLE IF NOT EXISTS public.user_wills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Testament section
  testament_title TEXT,
  testament_content TEXT,
  special_instructions TEXT,
  digital_assets_instructions TEXT,
  personal_messages TEXT,
  
  -- Beneficiaries section
  primary_beneficiaries TEXT,
  contingent_beneficiaries TEXT,
  specific_bequests TEXT,
  residuary_clause TEXT,
  distribution_instructions TEXT,
  
  -- Executor section
  executor_name TEXT,
  executor_email TEXT,
  executor_phone TEXT,
  executor_relationship TEXT,
  alternate_executor_name TEXT,
  alternate_executor_email TEXT,
  alternate_executor_phone TEXT,
  executor_powers TEXT,
  executor_compensation TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one will per user
  UNIQUE(user_id)
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_user_wills_user_id ON public.user_wills(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notaries
CREATE POLICY "Users can view their own notaries"
  ON public.notaries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notaries"
  ON public.notaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notaries"
  ON public.notaries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notaries"
  ON public.notaries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for user_wills
CREATE POLICY "Users can view their own will"
  ON public.user_wills
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own will"
  ON public.user_wills
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own will"
  ON public.user_wills
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own will"
  ON public.user_wills
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp for notaries
CREATE OR REPLACE FUNCTION update_notaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notaries_updated_at
  BEFORE UPDATE ON public.notaries
  FOR EACH ROW
  EXECUTE FUNCTION update_notaries_updated_at();

-- Create trigger to update updated_at timestamp for user_wills
CREATE OR REPLACE FUNCTION update_user_wills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_wills_updated_at
  BEFORE UPDATE ON public.user_wills
  FOR EACH ROW
  EXECUTE FUNCTION update_user_wills_updated_at();
