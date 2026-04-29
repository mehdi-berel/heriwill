# HeriWill

A comprehensive open-source inheritance planning and vault management application built with Next.js and Supabase.

## Features

- **Vault Management**: Create and organize digital vaults for different purposes (share or delete after death)
- **Heir Management**: Add heirs and manage their permissions with secure invitation codes
- **Asset Tracking**: Keep track of digital assets and their designated recipients
- **Inheritance Triggers**: Set up automatic inheritance activation based on predefined conditions
- **Secure Storage**: End-to-end encryption for all sensitive data
- **Role-Based Access**: Different permission levels for owners, heirs, and trusted contacts
- **Inheritance Triggers**: Automated inheritance trigger system with verification workflows
- **File Storage**: Secure file upload and storage with signed URLs
- **Real-time Notifications**: In-app notification system
- **Self-Hosted**: Full control over your data with no subscription tiers or limits

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Sanitization**: DOMPurify, isomorphic-dompurify

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mehdi-berel/heriwill.git
   cd heriwill
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables:
   
   **Required Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `CRON_SECRET`: Secure secret for cron job authentication (generate with `openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL`: Your application URL (e.g., `http://localhost:3000` for development)
   
   **Optional Variables:**
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics measurement ID (leave empty to disable analytics)

4. **Set up Supabase database**

   Run the following SQL in your Supabase SQL editor to create the database tables:

   CREATE TABLE public.assets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['real_estate'::text, 'vehicle'::text, 'bank_account'::text, 'investment'::text, 'insurance'::text, 'personal_property'::text, 'business'::text, 'other'::text])),
  description text,
  value numeric,
  location text,
  ownership_type text NOT NULL CHECK (ownership_type = ANY (ARRAY['sole'::text, 'joint'::text, 'tenants_in_common'::text, 'community_property'::text])),
  documents ARRAY DEFAULT '{}'::text[],
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  vault_id uuid,
  heir_ids ARRAY DEFAULT '{}'::uuid[],
  CONSTRAINT assets_pkey PRIMARY KEY (id),
  CONSTRAINT assets_vault_id_fkey FOREIGN KEY (vault_id) REFERENCES public.vaults(id),
  CONSTRAINT assets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.heirs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  heir_user_id uuid,
  notify_on_activation boolean DEFAULT true,
  notification_delay_days integer DEFAULT 0 CHECK (notification_delay_days >= 0),
  is_active boolean DEFAULT true,
  has_accepted boolean DEFAULT false,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  invitation_code text UNIQUE,
  invitation_status text DEFAULT 'pending'::text CHECK (invitation_status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'expired'::text])),
  invitation_expires_at timestamp with time zone,
  invited_at timestamp with time zone DEFAULT now(),
  rejected_at timestamp with time zone,
  relationship text,
  notification_status text DEFAULT 'pending'::text,
  notified_at timestamp with time zone,
  name text,
  email text,
  phone text,
  heir_type text DEFAULT 'family'::text CHECK (heir_type = ANY (ARRAY['family'::text, 'friend'::text, 'professional'::text, 'organization'::text, 'notary'::text])),
  CONSTRAINT heirs_pkey PRIMARY KEY (id),
  CONSTRAINT heirs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT heirs_heir_user_id_fkey FOREIGN KEY (heir_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.inheritance_triggers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  trigger_metadata jsonb,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::trigger_status_type,
  requires_verification boolean DEFAULT true,
  verification_code text,
  verified_at timestamp with time zone,
  verified_by uuid,
  triggered_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  trigger_reason text,
  CONSTRAINT inheritance_triggers_pkey PRIMARY KEY (id),
  CONSTRAINT inheritance_triggers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT inheritance_triggers_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id)
);
CREATE TABLE public.notaries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  firm_name text,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  license_number text,
  specialization text,
  notes text,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notaries_pkey PRIMARY KEY (id),
  CONSTRAINT notaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['heir_invitation'::text, 'inheritance_triggered'::text, 'vault_shared'::text, 'false_alarm'::text, 'heir_accepted'::text, 'heir_rejected'::text, 'subscription_update'::text, 'system_alert'::text])),
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
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.shared_vaults (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  vault_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  shared_with_user_id uuid NOT NULL,
  is_active boolean DEFAULT true,
  accepted boolean DEFAULT false,
  accepted_at timestamp with time zone,
  shared_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT shared_vaults_pkey PRIMARY KEY (id),
  CONSTRAINT shared_vaults_vault_id_fkey FOREIGN KEY (vault_id) REFERENCES public.vaults(id),
  CONSTRAINT shared_vaults_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id),
  CONSTRAINT shared_vaults_shared_with_user_id_fkey FOREIGN KEY (shared_with_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
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
  global_trigger_method text DEFAULT 'inactivity'::text CHECK (global_trigger_method = ANY (ARRAY['inactivity'::text, 'death_certificate'::text, 'manual_trigger'::text, 'scheduled'::text, 'trusted_contact'::text, 'heir_notification'::text])),
  global_trigger_settings jsonb DEFAULT '{"inactivity_days": 30}'::jsonb,
  global_scheduled_date timestamp with time zone,
  last_activity timestamp with time zone DEFAULT now(),
  last_reminder_sent_at timestamp with time zone,
  trusted_contact_heir_id uuid,
  locked_until timestamp with time zone,
  failed_login_attempts integer DEFAULT 0,
  user_type text DEFAULT 'user'::text CHECK (user_type = ANY (ARRAY['user'::text, 'notary'::text])),
  inheritance_triggered boolean DEFAULT false,
  inheritance_triggered_at timestamp with time zone,
  account_deactivation_date timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT users_trusted_contact_heir_id_fkey FOREIGN KEY (trusted_contact_heir_id) REFERENCES public.heirs(id)
);
CREATE TABLE public.vault_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  vault_id uuid NOT NULL,
  user_id uuid NOT NULL,
  item_type USER-DEFINED NOT NULL,
  storage_path text NOT NULL UNIQUE,
  storage_bucket text NOT NULL DEFAULT 'vault-files'::text,
  file_size bigint,
  title_encrypted text NOT NULL,
  tags ARRAY,
  is_favorite boolean DEFAULT false,
  password_strength integer CHECK (password_strength IS NULL OR password_strength >= 0 AND password_strength <= 100),
  password_last_changed timestamp with time zone,
  requires_password_change boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_accessed timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT vault_items_pkey PRIMARY KEY (id),
  CONSTRAINT vault_items_vault_id_fkey FOREIGN KEY (vault_id) REFERENCES public.vaults(id),
  CONSTRAINT vault_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.vaults (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
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
  sort_order integer DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_accessed timestamp with time zone,
  category text NOT NULL DEFAULT 'share'::text CHECK (category = ANY (ARRAY['share'::text, 'delete'::text])),
  CONSTRAINT vaults_pkey PRIMARY KEY (id),
  CONSTRAINT vaults_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

   The schema includes:
   - Tables: assets, heirs, inheritance_triggers, notaries, notifications, shared_vaults, users, vault_items, vaults
   - Row Level Security (RLS) policies
   - Database indexes
   - Functions and triggers

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **users**: User profiles and settings
- **vaults**: Digital vaults for organizing assets and documents
- **vault_items**: Items stored within vaults
- **assets**: Detailed asset information and metadata
- **heirs**: Designated heirs with invitation and verification status
- **inheritance_triggers**: Trigger events for inheritance activation
- **notifications**: User notifications
- **shared_vaults**: Vault sharing between users

See `schema.sql` for the complete database schema.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

Ensure all environment variables are set in your deployment environment.

## Security Features

- Row Level Security (RLS) on all database tables
- Input sanitization using DOMPurify
- Secure file upload with signed URLs
- Audit logging for sensitive operations

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Supabase](https://supabase.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
