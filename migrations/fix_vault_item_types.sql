-- Fix vault_items.item_type enum to include all valid vault item types
-- The database has an existing enum type 'vault_item_type' that needs to be extended

-- Add missing enum values to the existing vault_item_type enum
-- Note: ALTER TYPE ADD VALUE cannot be run inside a transaction block in some PostgreSQL versions
-- If this fails, run each ALTER TYPE statement separately

-- Add 'legal' to the enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'legal' AND enumtypid = 'vault_item_type'::regtype) THEN
        ALTER TYPE vault_item_type ADD VALUE 'legal';
    END IF;
END $$;

-- Add 'assets' to the enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'assets' AND enumtypid = 'vault_item_type'::regtype) THEN
        ALTER TYPE vault_item_type ADD VALUE 'assets';
    END IF;
END $$;

-- Verify all expected values exist in the enum
-- Expected values: password, document, video, image, note, crypto, bank, other, legal, assets
