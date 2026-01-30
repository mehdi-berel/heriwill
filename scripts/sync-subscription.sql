-- Manual script to sync your Pro subscription to the database
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users

-- Update your user's subscription to Pro
UPDATE public.users
SET 
  subscription_tier = 'pro',
  subscription_status = 'active',
  subscription_expires_at = NOW() + INTERVAL '1 month', -- Adjust based on your billing period
  updated_at = NOW()
WHERE id = 'YOUR_USER_ID'; -- Replace with your actual user ID

-- To find your user ID, run this first:
-- SELECT id, email, full_name, subscription_tier FROM public.users WHERE email = 'your-email@example.com';
