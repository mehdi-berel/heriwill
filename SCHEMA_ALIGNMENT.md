# Supabase Schema Alignment Report

## Current Schema Status

### ✅ Existing Tables in Supabase
Based on `types/database.ts`, the following tables exist:

1. **heirs** - Fully implemented
   - Fields: id, user_id, full_name_encrypted, email_encrypted, phone_encrypted, relationship, access_level, invitation_status, invitation_code, etc.
   - Enums: access_level_type ("full" | "partial" | "view")

2. **assets** - Physical assets tracking
   - Fields: id, user_id, name, type, value, beneficiaries, documents, etc.

3. **beneficiaries** - Legacy beneficiaries table
   - Fields: id, user_id, name, email, phone, relationship, verification_method, etc.

4. **digital_assets** - Digital accounts/passwords
   - Fields: id, user_id, name, type, url, username, encrypted_password, beneficiary_id, etc.

5. **legacy_instructions** - Instructions for heirs
   - Fields: id, user_id, title, content, instruction_type, beneficiary_id, etc.

### ❌ Missing Tables

The following tables are referenced in the code but **DO NOT EXIST** in Supabase:

1. **vaults** - Main vault storage table
2. **vault_items** - Items within vaults
3. **vault_heirs** - Junction table for vault-heir assignments
4. **user_profiles** - User profile information

## Required Schema Migrations

### 1. Create `vaults` Table

```sql
CREATE TABLE vaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('share_after_death', 'delete_after_death', 'sign_off_after_death')),
  is_encrypted BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  item_count INTEGER DEFAULT 0,
  icon TEXT,
  color TEXT,
  access_control JSONB DEFAULT '{"allowedHeirs": [], "requireApproval": false}'::jsonb,
  death_settings JSONB DEFAULT '{"notifyContacts": true, "triggerAfterDays": 30, "instructions": ""}'::jsonb,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vaults_user_id ON vaults(user_id);
CREATE INDEX idx_vaults_category ON vaults(category);
```

### 2. Create `vault_items` Table

```sql
CREATE TABLE vault_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('password', 'document', 'video', 'image', 'note', 'crypto', 'bank', 'other')),
  file_path TEXT,
  file_size BIGINT DEFAULT 0,
  is_encrypted BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vault_items_vault_id ON vault_items(vault_id);
CREATE INDEX idx_vault_items_type ON vault_items(type);
```

### 3. Create `vault_heirs` Junction Table

```sql
CREATE TABLE vault_heirs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  heir_id UUID NOT NULL REFERENCES heirs(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL CHECK (access_level IN ('full', 'partial', 'view')),
  can_download BOOLEAN DEFAULT true,
  can_delete BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(vault_id, heir_id)
);

CREATE INDEX idx_vault_heirs_vault_id ON vault_heirs(vault_id);
CREATE INDEX idx_vault_heirs_heir_id ON vault_heirs(heir_id);
```

### 4. Create `user_profiles` Table

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  address JSONB,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

## Row Level Security (RLS) Policies

### Vaults RLS

```sql
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

-- Users can view their own vaults
CREATE POLICY "Users can view own vaults"
  ON vaults FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own vaults
CREATE POLICY "Users can insert own vaults"
  ON vaults FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own vaults
CREATE POLICY "Users can update own vaults"
  ON vaults FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own vaults
CREATE POLICY "Users can delete own vaults"
  ON vaults FOR DELETE
  USING (auth.uid() = user_id);
```

### Vault Items RLS

```sql
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;

-- Users can view items in their vaults
CREATE POLICY "Users can view items in own vaults"
  ON vault_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vaults
      WHERE vaults.id = vault_items.vault_id
      AND vaults.user_id = auth.uid()
    )
  );

-- Similar policies for INSERT, UPDATE, DELETE
```

### Vault Heirs RLS

```sql
ALTER TABLE vault_heirs ENABLE ROW LEVEL SECURITY;

-- Users can manage heir assignments for their vaults
CREATE POLICY "Users can manage heir assignments"
  ON vault_heirs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM vaults
      WHERE vaults.id = vault_heirs.vault_id
      AND vaults.user_id = auth.uid()
    )
  );
```

## Code Alignment Issues

### 1. Interface Mismatches

**Heirs Interface:**
- Code uses `full_name`, `email`, `phone` (decrypted)
- Database has `full_name_encrypted`, `email_encrypted`, `phone_encrypted`
- **Solution:** Add decryption layer or use encrypted fields consistently

**Vault Interface:**
- Code defines complete Vault interface
- Database table doesn't exist yet
- **Solution:** Create vaults table with migration above

### 2. Mock Data Usage

Currently, the app uses mock data for:
- Vaults (in `vaults/page.tsx`)
- Vault items (in `vaults/[id]/page.tsx`)
- Heirs (in `vault-assign.tsx`)

**Solution:** Replace mock data with Supabase queries after migrations

### 3. Missing Checkbox Component

The `vault-assign.tsx` component imports `@/components/ui/checkbox` which doesn't exist.

**Solution:** Create checkbox component or use alternative UI element

## Implementation Recommendations

### Priority 1: Database Migrations
1. Run the SQL migrations above in Supabase SQL Editor
2. Update `types/database.ts` to include new tables
3. Test RLS policies

### Priority 2: Update Code
1. Replace mock data with real Supabase queries
2. Add encryption/decryption utilities for heir data
3. Create missing UI components (checkbox)
4. Update vault assignment to use `vault_heirs` junction table

### Priority 3: Features
1. Implement file upload to Supabase Storage
2. Add vault sharing functionality
3. Implement heir notification system
4. Add vault access logs

## Current Implementation Status

✅ **Completed:**
- VaultAssign component created
- Modal edit/delete functionality added
- Vault [id] page updated with assign heirs button

⚠️ **Needs Database:**
- Vaults table creation
- Vault items table creation
- Vault-heirs junction table
- User profiles table

❌ **Blocked:**
- Real data persistence (needs migrations)
- File upload (needs Storage setup)
- Heir assignment persistence (needs vault_heirs table)

## Next Steps

1. **Run migrations** in Supabase SQL Editor
2. **Update database types** by regenerating from Supabase CLI
3. **Replace mock data** with real queries
4. **Test RLS policies** to ensure security
5. **Add encryption layer** for sensitive heir data
