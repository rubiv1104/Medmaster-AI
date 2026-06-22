-- ============================================================
-- MedMaster AI — Migration 001: Core Schema
-- Run via: supabase db push
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (shadow of auth.users with app-specific fields)
-- ============================================================
CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  college       TEXT,
  branch        TEXT,                          -- e.g. 'MD Kayachikitsa'
  batch_year    INT,
  avatar_url    TEXT,
  xp_total      INT     DEFAULT 0,
  academic_rank_score    NUMERIC DEFAULT 0,
  contributor_rank_score NUMERIC DEFAULT 0,
  rcs_score              NUMERIC DEFAULT 0,    -- 0–100; Revision Consistency Score
  onboarding_completed   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SYLLABI  (one per user per branch; user-owned)
-- ============================================================
CREATE TABLE public.syllabi (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  branch      TEXT NOT NULL,                  -- 'MD Kayachikitsa' etc.
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SECTIONS  (chapters / units within a syllabus)
-- ============================================================
CREATE TABLE public.sections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  syllabus_id UUID REFERENCES public.syllabi(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INT  DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TOPICS  (leaf nodes — what students study and revise)
-- ============================================================
CREATE TABLE public.topics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID REFERENCES public.sections(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  is_custom   BOOLEAN DEFAULT FALSE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER_TOPIC_PROGRESS  (core state per user × topic)
-- ============================================================
CREATE TABLE public.user_topic_progress (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id         UUID REFERENCES public.topics(id) ON DELETE CASCADE,

  -- Level: 0=not_started, 1=studied, 2=completed, 3=revised, 4=mastered
  level            INT DEFAULT 0 CHECK (level BETWEEN 0 AND 4),

  retention_score  NUMERIC DEFAULT 0 CHECK (retention_score BETWEEN 0 AND 100),
  knowledge_health TEXT DEFAULT 'not_started'
    CHECK (knowledge_health IN ('not_started','excellent','good','needs_revision','at_risk')),

  last_studied_at  TIMESTAMPTZ,
  next_revision_at TIMESTAMPTZ,
  revision_count   INT DEFAULT 0,
  mcq_avg_score    NUMERIC DEFAULT 0,
  snooze_count     INT DEFAULT 0,
  is_overdue       BOOLEAN DEFAULT FALSE,

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, topic_id)
);

-- ============================================================
-- REVISION_LOG  (every scheduled revision event)
-- ============================================================
CREATE TABLE public.revision_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id      UUID REFERENCES public.topics(id) ON DELETE CASCADE,

  scheduled_for TIMESTAMPTZ NOT NULL,
  completed_at  TIMESTAMPTZ,
  status        TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','completed','snoozed','overdue')),

  mcq_score       NUMERIC,
  retention_delta NUMERIC DEFAULT 0,

  revision_number INT DEFAULT 1,              -- which revision in the series (1,2,3,4,5)
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESOURCES  (uploaded files — PDF, PPT, DOCX, images)
-- ============================================================
CREATE TABLE public.resources (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id          UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  uploaded_by       UUID REFERENCES public.users(id) ON DELETE CASCADE,

  title             TEXT NOT NULL,
  file_type         TEXT CHECK (file_type IN ('pdf','ppt','pptx','docx','image','other')),
  storage_path      TEXT NOT NULL,            -- Supabase Storage key
  file_size_bytes   BIGINT,
  visibility        TEXT DEFAULT 'public' CHECK (visibility IN ('public','private')),

  save_count        INT DEFAULT 0,
  upvote_count      INT DEFAULT 0,

  ai_processed      BOOLEAN DEFAULT FALSE,
  processing_status TEXT DEFAULT 'pending'
    CHECK (processing_status IN ('pending','processing','completed','failed')),

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVISION_NOTES  (AI-generated concise revision content)
-- ============================================================
CREATE TABLE public.revision_notes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id     UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  resource_id  UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  generated_by UUID REFERENCES public.users(id) ON DELETE CASCADE,

  content      TEXT NOT NULL,                 -- markdown
  model_used   TEXT,
  visibility   TEXT DEFAULT 'private' CHECK (visibility IN ('public','private')),
  save_count   INT DEFAULT 0,

  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MCQS  (generated or manually created questions)
-- ============================================================
CREATE TABLE public.mcqs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id       UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  resource_id    UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  created_by     UUID REFERENCES public.users(id) ON DELETE CASCADE,

  question       TEXT NOT NULL,
  options        JSONB NOT NULL,              -- [{label:'A',text:'...'}, ...]
  correct_option TEXT NOT NULL,              -- 'A' | 'B' | 'C' | 'D'
  explanation    TEXT,
  difficulty     TEXT DEFAULT 'moderate'
    CHECK (difficulty IN ('easy','moderate','hard')),
  source         TEXT DEFAULT 'ai' CHECK (source IN ('ai','manual')),
  upvote_count   INT DEFAULT 0,
  is_verified    BOOLEAN DEFAULT FALSE,

  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TEST_ATTEMPTS  (each MCQ session a user does)
-- ============================================================
CREATE TABLE public.test_attempts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id     UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  mcq_ids      UUID[] NOT NULL,
  answers      JSONB NOT NULL,               -- {mcq_id: chosen_option}
  score        NUMERIC NOT NULL CHECK (score BETWEEN 0 AND 100),
  context      TEXT DEFAULT 'quick_mcq'
    CHECK (context IN ('revision','quick_mcq','recall_challenge','onboarding')),
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DISCUSSIONS  (topic-scoped threads)
-- ============================================================
CREATE TABLE public.discussions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id     UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  author_id    UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  upvote_count INT DEFAULT 0,
  reply_count  INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.discussion_replies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  author_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  body          TEXT NOT NULL,
  upvote_count  INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED_RESOURCES
-- ============================================================
CREATE TABLE public.saved_resources (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, resource_id)
);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE public.achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  xp_reward   INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_achievements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_utp_user_next_revision  ON public.user_topic_progress(user_id, next_revision_at);
CREATE INDEX idx_utp_user_topic          ON public.user_topic_progress(user_id, topic_id);
CREATE INDEX idx_utp_overdue             ON public.user_topic_progress(is_overdue) WHERE is_overdue = TRUE;
CREATE INDEX idx_utp_level               ON public.user_topic_progress(user_id, level);
CREATE INDEX idx_revision_log_user_sched ON public.revision_log(user_id, scheduled_for);
CREATE INDEX idx_revision_log_status     ON public.revision_log(status) WHERE status = 'scheduled';
CREATE INDEX idx_resources_topic_vis     ON public.resources(topic_id, visibility);
CREATE INDEX idx_mcqs_topic_diff         ON public.mcqs(topic_id, difficulty);
CREATE INDEX idx_topics_section          ON public.topics(section_id, sort_order);
CREATE INDEX idx_sections_syllabus       ON public.sections(syllabus_id, sort_order);
CREATE INDEX idx_syllabi_user            ON public.syllabi(user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- updated_at automation
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_utp_updated_at
  BEFORE UPDATE ON public.user_topic_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create public.users row when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Knowledge health from retention score
CREATE OR REPLACE FUNCTION public.calculate_knowledge_health(retention NUMERIC)
RETURNS TEXT LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF retention IS NULL OR retention = 0 THEN RETURN 'not_started'; END IF;
  IF retention >= 80 THEN RETURN 'excellent'; END IF;
  IF retention >= 60 THEN RETURN 'good'; END IF;
  IF retention >= 40 THEN RETURN 'needs_revision'; END IF;
  RETURN 'at_risk';
END;
$$;

-- Compute RCS for a user (% scheduled revisions completed on time)
CREATE OR REPLACE FUNCTION public.compute_rcs(p_user_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql AS $$
DECLARE
  total_scheduled INT;
  completed_on_time INT;
BEGIN
  SELECT COUNT(*) INTO total_scheduled
  FROM public.revision_log
  WHERE user_id = p_user_id
    AND scheduled_for <= NOW() - INTERVAL '7 days';   -- only count revisions old enough to have been done

  IF total_scheduled = 0 THEN RETURN 100; END IF;

  SELECT COUNT(*) INTO completed_on_time
  FROM public.revision_log
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND scheduled_for <= NOW() - INTERVAL '7 days';

  RETURN ROUND((completed_on_time::NUMERIC / total_scheduled) * 100, 1);
END;
$$;

-- Decay retention for a single user_topic_progress row
-- Called nightly by pg_cron via Edge Function
CREATE OR REPLACE FUNCTION public.decay_topic_retention(p_utp_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  utp public.user_topic_progress%ROWTYPE;
  days_overdue INT;
  new_retention NUMERIC;
  decay_rate NUMERIC := 5;    -- % per day overdue (tunable)
BEGIN
  SELECT * INTO utp FROM public.user_topic_progress WHERE id = p_utp_id;

  IF utp IS NULL THEN RETURN; END IF;
  IF utp.next_revision_at IS NULL THEN RETURN; END IF;
  IF utp.next_revision_at > NOW() THEN RETURN; END IF;  -- not overdue yet

  days_overdue := GREATEST(0, EXTRACT(DAY FROM NOW() - utp.next_revision_at)::INT);

  new_retention := GREATEST(0, utp.retention_score - (decay_rate * days_overdue));

  UPDATE public.user_topic_progress
  SET
    retention_score  = new_retention,
    knowledge_health = public.calculate_knowledge_health(new_retention),
    is_overdue       = TRUE,
    updated_at       = NOW()
  WHERE id = p_utp_id;
END;
$$;
