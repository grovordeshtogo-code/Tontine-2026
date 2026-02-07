-- Add wallet_balance column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS "wallet_balance" INTEGER DEFAULT 0;
