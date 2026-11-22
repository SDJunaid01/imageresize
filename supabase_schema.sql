-- =========================================================================
-- OPTIGLASS IMAGE RESIZER & QUALITY COMPRESSOR
-- Clean Idempotent Supabase Database Schema
-- =========================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  storage_saved_bytes BIGINT DEFAULT 0,
  total_compressions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. PROJECTS & ACTIVITY HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_size_bytes BIGINT NOT NULL,
  original_width INTEGER NOT NULL,
  original_height INTEGER NOT NULL,
  variants_count INTEGER NOT NULL DEFAULT 1,
  variants_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_base64 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Clean RLS Policies for Projects
DROP POLICY IF EXISTS "Users can access own projects" ON public.projects;
CREATE POLICY "Users can access own projects" ON public.projects 
  FOR ALL USING (auth.uid() = user_id);

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_projects_user_created ON public.projects (user_id, created_at DESC);


-- 3. GOOGLE OAUTH AUTO-PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO anon, authenticated;
GRANT ALL ON TABLE public.projects TO anon, authenticated;
