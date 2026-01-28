# Supabase Schema Analysis & Alignment

## Database Overview

The Supabase database for project `okohwzkblihuwfvvgtvh` has been analyzed and contains a comprehensive schema with the following tables:

### Core Tables

1. **users** - 7 rows
   - User accounts with authentication, subscription, and trigger settings
   - Fields: id, email, full_name, avatar_url, subscription_tier, global_trigger_method, etc.

2. **vaults** - 6 rows  
   - User vaults for storing digital assets
   - Fields: id, user_id, name, description, category, is_encrypted, access_control, death_settings
   - Categories: 'delete_after_death', 'share_after_death', 'sign_off_after_death'

3. **vault_items** - 13 rows
   - Items stored within vaults
   - Fields: id, vault_id, user_id, item_type, storage_path, title_encrypted
   - Types: password, document, video, image, note, crypto, bank, other

4. **heirs** - 4 rows
   - Designated heirs for inheritance
   - Fields: id, user_id, full_name_encrypted, email_encrypted, phone_encrypted, relationship, access_level, invitation_status
   - Access levels: full, partial, view

5. **inheritance_plans** - 0 rows
   - Inheritance plan configurations
   - Fields: id, user_id, plan_name, plan_type, is_active, is_triggered

6. **heir_vault_access** - 0 rows
   - Maps heir access permissions to specific vaults
   - Fields: id, heir_id, vault_id, can_view, can_edit, can_export

### Supporting Tables

7. **shared_vaults** - Vault sharing between users
8. **inheritance_triggers** - Death detection triggers
9. **audit_logs** - Activity logging
10. **user_sessions** - Session management
11. **user_activity** - Activity tracking
12. **subscriptions** - Subscription management
13. **assets** - Asset management

## Key Findings

### ✅ What's Working

1. **Vaults table exists** - The code references `vaults` table which exists in Supabase
2. **Heirs table exists** - The code references `heirs` table which exists
3. **Vault items table exists** - The code references `vault_items` table which exists
4. **Proper encryption fields** - Database uses `_encrypted` suffix for sensitive data
5. **RLS enabled** - All tables have Row Level Security enabled

### ⚠️ Schema Mismatches

#### 1. Heirs Table Field Mapping
**Database has:**
- `full_name_encrypted` (encrypted)
- `email_encrypted` (encrypted)
- `phone_encrypted` (encrypted)
- `relationship` (plain text)

**Code expects:**
- `full_name` (plain text)
- `email` (plain text)  
- `phone` (plain text)
- `relationship` (plain text)

**Impact:** Code is treating encrypted fields as plain text, causing display issues

#### 2. Missing Fields in Code
**Database has but code doesn't use:**
- `heir_user_id` - Links heir to actual user account
- `inheritance_plan_id` - Links heir to inheritance plan
- `notification_delay_days` - Delay before notifying heir
- `notify_on_activation` - Whether to notify on activation
- `notification_status` - Current notification status
- `death_confirmed_at` - When death was confirmed

#### 3. Vault Access Control
**Database structure:**
- `access_control` JSONB field with `allowedHeirs` array
- Separate `heir_vault_access` table for granular permissions

**Code usage:**
- Only uses `access_control.allowedHeirs` array
- Doesn't utilize `heir_vault_access` table

#### 4. Missing Heir Type Field
**Code added:**
- `heir_type` field ('family' | 'friend' | 'professional' | 'organization')

**Database:**
- Does NOT have `heir_type` field
- Only has `relationship` text field

## Recommendations

### Immediate Actions

1. **Add heir_type column to heirs table**
   ```sql
   ALTER TABLE heirs 
   ADD COLUMN heir_type TEXT 
   CHECK (heir_type IN ('family', 'friend', 'professional', 'organization'));
   ```

2. **Update code to handle encrypted fields**
   - Decrypt `full_name_encrypted`, `email_encrypted`, `phone_encrypted` when displaying
   - Encrypt data before inserting/updating

3. **Use proper field names in queries**
   - Change code to use `full_name_encrypted` instead of `full_name`
   - Change code to use `email_encrypted` instead of `email`
   - Change code to use `phone_encrypted` instead of `phone`

### Optional Enhancements

1. **Utilize heir_vault_access table**
   - Implement granular vault permissions
   - Track when heirs access vaults

2. **Implement inheritance_plans**
   - Link heirs to specific inheritance plans
   - Support multiple inheritance scenarios

3. **Add notification features**
   - Use `notification_delay_days`
   - Track `notification_status`
   - Implement death confirmation workflow

## Current Status

- ✅ Database schema is comprehensive and production-ready
- ✅ All core tables exist (users, vaults, vault_items, heirs)
- ⚠️ Code needs updates to match encrypted field names
- ⚠️ Need to add `heir_type` column to database
- ⚠️ Encryption/decryption logic needs implementation

## Next Steps

1. Run migration to add `heir_type` column
2. Update TypeScript types in `database.ts`
3. Implement encryption/decryption utilities
4. Update all heir-related queries to use encrypted fields
5. Test vault and heir CRUD operations
