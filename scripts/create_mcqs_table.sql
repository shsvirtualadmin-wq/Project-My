-- ==========================================
-- BOARDLY SUPABASE MCQS TABLE DDL & RLS SCRIPT
-- ==========================================

-- 1. CREATE MCQS TABLE
CREATE TABLE IF NOT EXISTS public.mcqs (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  class_number INT,
  stream TEXT,
  question_stem TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'Exam Standard',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.mcqs ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES FOR READ AND WRITE
DROP POLICY IF EXISTS "Allow public read access for mcqs" ON public.mcqs;
CREATE POLICY "Allow public read access for mcqs"
  ON public.mcqs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert access for mcqs" ON public.mcqs;
CREATE POLICY "Allow anon insert access for mcqs"
  ON public.mcqs FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update access for mcqs" ON public.mcqs;
CREATE POLICY "Allow anon update access for mcqs"
  ON public.mcqs FOR UPDATE
  USING (true);
