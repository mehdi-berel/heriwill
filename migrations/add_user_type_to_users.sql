-- Add user_type column to users table to differentiate between regular users and notary professionals
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'user'::text 
CHECK (user_type = ANY (ARRAY['user'::text, 'notary'::text]));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS users_user_type_idx ON public.users(user_type);

-- Comment on column
COMMENT ON COLUMN public.users.user_type IS 'Type of user account: user (regular with subscription tiers) or notary (professional account)';
