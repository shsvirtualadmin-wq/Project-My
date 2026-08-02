-- DDL for MCQ Attempts tracking & Adaptive Learning Student Performance View in Supabase Postgres

-- 1. MCQ ATTEMPTS LOG TABLE
CREATE TABLE IF NOT EXISTS public.mcq_attempts (
  id BIGSERIAL PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_email TEXT,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  question_id TEXT,
  question_text TEXT,
  selected_answer INT,
  correct_answer INT,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast performance queries by student and subject
CREATE INDEX IF NOT EXISTS idx_mcq_attempts_student_subject 
ON public.mcq_attempts (student_id, subject);

CREATE INDEX IF NOT EXISTS idx_mcq_attempts_student_created
ON public.mcq_attempts (student_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.mcq_attempts ENABLE ROW LEVEL SECURITY;

-- Allow students to read/write their own attempts
CREATE POLICY "Students manage own mcq_attempts" ON public.mcq_attempts
  FOR ALL USING (auth.uid()::text = student_id);

-- Allow admin full access
CREATE POLICY "Admin full access mcq_attempts" ON public.mcq_attempts
  FOR ALL USING ((auth.jwt() ->> 'email') = 'shsvirtualadmin@gmail.com');

-- 2. STUDENT PERFORMANCE & WEAKNESS SUMMARY VIEW
CREATE OR REPLACE VIEW public.student_performance_view AS
SELECT 
  student_id,
  student_email,
  subject,
  chapter,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_attempts,
  ROUND((SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100) as accuracy_percentage,
  ROUND(AVG(time_taken_seconds)) as avg_time_seconds,
  MAX(created_at) as last_attempt_at
FROM public.mcq_attempts
GROUP BY student_id, student_email, subject, chapter;
