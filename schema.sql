-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.assets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  description text,
  value numeric(15, 2),
  location text,
  ownership_type text NOT NULL,
  documents ARRAY DEFAULT '{}'::text[],
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  heir_ids ARRAY DEFAULT '{}'::uuid[],
  CONSTRAINT assets_pkey PRIMARY KEY (id),
  CONSTRAINT assets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT assets_ownership_type_check CHECK (ownership_type = ANY (ARRAY['sole'::text, 'joint'::text, 'tenants_in_common'::text, 'community_property'::text])),
  CONSTRAINT assets_type_check CHECK (type = ANY (ARRAY['real_estate'::text, 'vehicle'::text, 'bank_account'::text, 'investment'::text, 'insurance'::text, 'personal_property'::text, 'business'::text, 'other'::text]))
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_assets_heir_ids ON public.assets USING GIN (heir_ids) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets USING btree (user_id) TABLESPACE pg_default;

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE public.heirs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  heir_user_id uuid,
  notify_on_activation boolean DEFAULT true,
  notification_delay_days integer DEFAULT 0,
  is_active boolean DEFAULT true,
  has_accepted boolean DEFAULT false,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  invitation_code text UNIQUE,
  invitation_status text DEFAULT 'pending'::text,
  invitation_expires_at timestamp with time zone,
  invited_at timestamp with time zone DEFAULT now(),
  rejected_at timestamp with time zone,
  relationship text,
  notification_status text DEFAULT 'pending'::text,
  notified_at timestamp with time zone,
  name text,
  email text,
  phone text,
  heir_type text DEFAULT 'family'::text,
  CONSTRAINT heirs_pkey PRIMARY KEY (id),
  CONSTRAINT heirs_invitation_code_key UNIQUE (invitation_code),
  CONSTRAINT heirs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT heirs_heir_user_id_fkey FOREIGN KEY (heir_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT heirs_invitation_status_check CHECK (invitation_status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'expired'::text])),
  CONSTRAINT heirs_heir_type_check CHECK (heir_type = ANY (ARRAY['family'::text, 'friend'::text, 'professional'::text, 'organization'::text, 'notary'::text])),
  CONSTRAINT heirs_notification_delay_check CHECK (notification_delay_days >= 0)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_heirs_user_id ON public.heirs USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_heirs_heir_user_id ON public.heirs USING btree (heir_user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_heirs_is_active ON public.heirs USING btree (is_active) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_heirs_invitation_code ON public.heirs USING btree (invitation_code) TABLESPACE pg_default WHERE (invitation_code IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_heirs_invitation_status ON public.heirs USING btree (invitation_status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_heirs_expires_at ON public.heirs USING btree (invitation_expires_at) TABLESPACE pg_default WHERE (invitation_expires_at IS NOT NULL);

CREATE TRIGGER set_invitation_expiration_trigger BEFORE INSERT ON heirs FOR EACH ROW
  EXECUTE FUNCTION set_invitation_expiration();
CREATE TRIGGER trigger_check_invitation_expiration BEFORE UPDATE ON heirs FOR EACH ROW
  EXECUTE FUNCTION check_invitation_expiration();
  
CREATE TABLE public.inheritance_triggers (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  trigger_metadata jsonb,
  status public.trigger_status_type NOT NULL DEFAULT 'pending'::trigger_status_type,
  requires_verification boolean DEFAULT true,
  verification_code text,
  verified_at timestamp with time zone,
  verified_by uuid,
  triggered_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  trigger_reason text,
  CONSTRAINT inheritance_triggers_pkey PRIMARY KEY (id),
  CONSTRAINT inheritance_triggers_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT inheritance_triggers_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES users(id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_inheritance_triggers_user_id ON public.inheritance_triggers USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_inheritance_triggers_status ON public.inheritance_triggers USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_inheritance_triggers_triggered_at ON public.inheritance_triggers USING btree (triggered_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_inheritance_triggers_verified_by ON public.inheritance_triggers USING btree (verified_by) TABLESPACE pg_default;

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  action_label text,
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  priority text DEFAULT 'normal'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone,
  archived_at timestamp with time zone,
  expires_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT notifications_priority_check CHECK (priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])),
  CONSTRAINT notifications_type_check CHECK (type = ANY (ARRAY['heir_invitation'::text, 'inheritance_triggered'::text, 'vault_shared'::text, 'false_alarm'::text, 'heir_accepted'::text, 'heir_rejected'::text, 'subscription_update'::text, 'system_alert'::text]))
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications USING btree (is_read) TABLESPACE pg_default WHERE (is_read = false);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at DESC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications USING btree (type) TABLESPACE pg_default;

CREATE TABLE public.shared_vaults (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  vault_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  shared_with_user_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  accepted boolean DEFAULT false,
  accepted_at timestamp with time zone,
  shared_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT shared_vaults_pkey PRIMARY KEY (id),
  CONSTRAINT shared_vaults_unique UNIQUE (vault_id, shared_with_user_id),
  CONSTRAINT shared_vaults_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT shared_vaults_shared_with_user_id_fkey FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT shared_vaults_vault_id_fkey FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_shared_vaults_vault_id ON public.shared_vaults USING btree (vault_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_shared_vaults_owner_id ON public.shared_vaults USING btree (owner_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_shared_vaults_shared_with_user_id ON public.shared_vaults USING btree (shared_with_user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_shared_vaults_is_active ON public.shared_vaults USING btree (is_active) TABLESPACE pg_default;

CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  emergency_contact_email text,
  emergency_contact_phone text,
  is_active boolean DEFAULT true,
  account_locked boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_login timestamp with time zone,
  email_verified boolean DEFAULT false,
  global_trigger_method text DEFAULT 'inactivity'::text,
  global_trigger_settings jsonb DEFAULT '{"inactivity_days": 30}'::jsonb,
  global_scheduled_date timestamp with time zone,
  last_activity timestamp with time zone DEFAULT now(),
  last_reminder_sent_at timestamp with time zone,
  trusted_contact_heir_id uuid,
  locked_until timestamp with time zone,
  failed_login_attempts integer DEFAULT 0,
  user_type text DEFAULT 'user'::text,
  inheritance_triggered boolean DEFAULT false,
  inheritance_triggered_at timestamp with time zone,
  account_deactivation_date timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT users_trusted_contact_heir_id_fkey FOREIGN KEY (trusted_contact_heir_id) REFERENCES heirs(id),
  CONSTRAINT users_global_trigger_method_check CHECK (global_trigger_method = ANY (ARRAY['inactivity'::text, 'death_certificate'::text, 'manual_trigger'::text, 'scheduled'::text, 'trusted_contact'::text, 'heir_notification'::text])),
  CONSTRAINT users_user_type_check CHECK (user_type = ANY (ARRAY['user'::text, 'notary'::text])),
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users USING btree (is_active) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users USING btree (last_login) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_trusted_contact_heir_id ON public.users USING btree (trusted_contact_heir_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users USING btree (email_verified) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_global_trigger_method ON public.users USING btree (global_trigger_method) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON public.users USING btree (last_activity) TABLESPACE pg_default WHERE (global_trigger_method = 'inactivity'::text);
CREATE INDEX IF NOT EXISTS idx_users_global_scheduled_date ON public.users USING btree (global_scheduled_date) TABLESPACE pg_default WHERE (global_trigger_method = 'scheduled'::text);
CREATE INDEX IF NOT EXISTS users_user_type_idx ON public.users USING btree (user_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_users_last_reminder ON public.users USING btree (last_reminder_sent_at) TABLESPACE pg_default;

CREATE TABLE public.vault_items (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  vault_id uuid NOT NULL,
  user_id uuid NOT NULL,
  item_type public.vault_item_type NOT NULL,
  storage_path text NOT NULL,
  storage_bucket text NOT NULL DEFAULT 'vault-files'::text,
  file_size bigint,
  title_encrypted text NOT NULL,
  tags text[],
  is_favorite boolean DEFAULT false,
  password_strength integer,
  password_last_changed timestamp with time zone,
  requires_password_change boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_accessed timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT vault_items_pkey PRIMARY KEY (id),
  CONSTRAINT vault_items_storage_path_unique UNIQUE (storage_path),
  CONSTRAINT vault_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT vault_items_vault_id_fkey FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE,
  CONSTRAINT vault_items_password_strength_check CHECK ((password_strength IS NULL) OR (password_strength >= 0 AND password_strength <= 100))
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_vault_items_vault_id ON public.vault_items USING btree (vault_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vault_items_user_id ON public.vault_items USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vault_items_tags ON public.vault_items USING GIN (tags) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vault_items_is_favorite ON public.vault_items USING btree (is_favorite) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vault_items_last_accessed ON public.vault_items USING btree (last_accessed) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vault_items_storage_path ON public.vault_items USING btree (storage_path) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vault_items_storage_bucket ON public.vault_items USING btree (storage_bucket) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vault_items_metadata ON public.vault_items USING GIN (metadata) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vault_items_item_type ON public.vault_items USING btree (item_type) TABLESPACE pg_default;

CREATE TRIGGER update_activity_on_vault_item_access AFTER INSERT OR UPDATE ON vault_items FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();

CREATE TABLE public.vaults (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  color text,
  settings jsonb DEFAULT '{"autoLock": true, "autoLockTimeout": 15, "twoFactorEnabled": false, "maxFailedAttempts": 5}'::jsonb,
  access_control jsonb DEFAULT '{"allowedHeirs": [], "allowedUsers": [], "requireApproval": true}'::jsonb,
  death_settings jsonb DEFAULT '{"notifySMS": [], "notifyEmail": [], "instructions": "", "notifyContacts": true, "triggerAfterDays": 30}'::jsonb,
  is_locked boolean DEFAULT false,
  is_shared boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_accessed timestamp with time zone,
  category text NOT NULL DEFAULT 'share'::text,
  CONSTRAINT vaults_pkey PRIMARY KEY (id),
  CONSTRAINT vaults_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT vaults_category_check CHECK (category = ANY (ARRAY['share'::text, 'delete'::text])),
  CONSTRAINT vaults_sort_order_check CHECK (sort_order >= 0)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON public.vaults USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_vaults_is_shared ON public.vaults USING btree (is_shared) TABLESPACE pg_default;

CREATE TRIGGER update_activity_on_vault_access AFTER INSERT OR UPDATE ON vaults FOR EACH ROW
  EXECUTE FUNCTION update_user_activity();