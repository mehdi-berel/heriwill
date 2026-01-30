-- Enable Row Level Security (RLS) for core tables
-- This migration adds RLS policies to allow users to manage their own data

-- Enable RLS on vaults table
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vaults
CREATE POLICY "Users can view their own vaults"
  ON public.vaults
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vaults"
  ON public.vaults
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaults"
  ON public.vaults
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaults"
  ON public.vaults
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on vault_items table
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vault_items
CREATE POLICY "Users can view their own vault items"
  ON public.vault_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault items"
  ON public.vault_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault items"
  ON public.vault_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault items"
  ON public.vault_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on heirs table
ALTER TABLE public.heirs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for heirs
CREATE POLICY "Users can view their own heirs"
  ON public.heirs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own heirs"
  ON public.heirs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own heirs"
  ON public.heirs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own heirs"
  ON public.heirs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on assets table
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assets
CREATE POLICY "Users can view their own assets"
  ON public.assets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
  ON public.assets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON public.assets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON public.assets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on inheritance_plans table
ALTER TABLE public.inheritance_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inheritance_plans
CREATE POLICY "Users can view their own inheritance plans"
  ON public.inheritance_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inheritance plans"
  ON public.inheritance_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inheritance plans"
  ON public.inheritance_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inheritance plans"
  ON public.inheritance_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on heir_vault_access table
ALTER TABLE public.heir_vault_access ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for heir_vault_access
-- Users can view access records for their heirs
CREATE POLICY "Users can view heir vault access for their heirs"
  ON public.heir_vault_access
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.heirs
      WHERE heirs.id = heir_vault_access.heir_id
      AND heirs.user_id = auth.uid()
    )
  );

-- Users can create access records for their heirs
CREATE POLICY "Users can insert heir vault access for their heirs"
  ON public.heir_vault_access
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.heirs
      WHERE heirs.id = heir_vault_access.heir_id
      AND heirs.user_id = auth.uid()
    )
  );

-- Users can update access records for their heirs
CREATE POLICY "Users can update heir vault access for their heirs"
  ON public.heir_vault_access
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.heirs
      WHERE heirs.id = heir_vault_access.heir_id
      AND heirs.user_id = auth.uid()
    )
  );

-- Users can delete access records for their heirs
CREATE POLICY "Users can delete heir vault access for their heirs"
  ON public.heir_vault_access
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.heirs
      WHERE heirs.id = heir_vault_access.heir_id
      AND heirs.user_id = auth.uid()
    )
  );

-- Enable RLS on legal_documents table (if exists)
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for legal_documents
CREATE POLICY "Users can view their own legal documents"
  ON public.legal_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own legal documents"
  ON public.legal_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own legal documents"
  ON public.legal_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legal documents"
  ON public.legal_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on shared_vaults table (if exists)
ALTER TABLE public.shared_vaults ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shared_vaults
-- Users can view vaults shared with them or that they own
CREATE POLICY "Users can view shared vaults"
  ON public.shared_vaults
  FOR SELECT
  USING (
    auth.uid() = owner_user_id OR
    auth.uid() = shared_with_user_id
  );

-- Only vault owners can share their vaults
CREATE POLICY "Users can share their own vaults"
  ON public.shared_vaults
  FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

-- Only vault owners can update sharing settings
CREATE POLICY "Users can update their own shared vaults"
  ON public.shared_vaults
  FOR UPDATE
  USING (auth.uid() = owner_user_id);

-- Only vault owners can revoke sharing
CREATE POLICY "Users can delete their own shared vaults"
  ON public.shared_vaults
  FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Create indexes for better performance on RLS queries
CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON public.vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_user_id ON public.vault_items(user_id);
CREATE INDEX IF NOT EXISTS idx_heirs_user_id ON public.heirs(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_inheritance_plans_user_id ON public.inheritance_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_user_id ON public.legal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_heir_vault_access_heir_id ON public.heir_vault_access(heir_id);
