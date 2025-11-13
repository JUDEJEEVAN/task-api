
-- FOUNDATION MIGRATION
-- -----------------------------------------------------
-- Purpose: Create ENUM types and user profiles table
-- This is the base schema all other tables depend on

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



-- ENUM TYPES
-- -----------------------------------------------------
-- These define the allowed values for our task system
-- Using ENUMs instead of TEXT gives us type safety

CREATE TYPE task_status AS ENUM (
    'todo', 
    'in_progress',
    'archived',
    'blocked',
    'done'
);

CREATE TYPE task_priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

CREATE TYPE project_status AS ENUM (
    'planning',
    'active',
    'on_hold',
    'completed',
    'rejected'
);

CREATE TYPE notification AS ENUM (
    'task_assigned',
    'task_completed',
    'comment_added',
    'due_date_reminder',
    'mention'
);




-- PROFILES TABLE
-- -----------------------------------------------------
-- Extends Supabase auth.users with app-specific data
-- We don't store passwords here (auth.users handles that)

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,

    created_at TIMESTAMPtZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);




-- index to speed up queries that search by name
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);




-- function to update the udpated_at whenever there is a change in the profiles
CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN 
    NEW.updated_at = now();
    return NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger to run the update_updated_at_column function before update
CREATE TRIGGER profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();



-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------
-- Security rules that control who can read/write data

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
    ON profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profiles"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert into their own profiles"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);