-- Add recipe metadata fields
ALTER TABLE IF EXISTS "recipes"
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "diet_type" TEXT;

-- Add cookbook cover image field
ALTER TABLE IF EXISTS "cookbooks"
ADD COLUMN IF NOT EXISTS "image" TEXT;
