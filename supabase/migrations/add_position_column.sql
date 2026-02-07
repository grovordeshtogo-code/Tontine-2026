-- Add position column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS "position" INTEGER DEFAULT 0;

-- Initialize position based on alphabetical order for existing members
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY full_name) as rn
  FROM members
)
UPDATE members
SET "position" = numbered.rn
FROM numbered
WHERE members.id = numbered.id;
