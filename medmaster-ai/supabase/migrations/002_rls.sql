-- ============================================================
-- MedMaster AI — Migration 002: Row Level Security
-- ============================================================

-- Enable RLS on every table
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabi            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcqs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_resources    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements  ENABLE ROW LEVEL SECURITY;

-- ── USERS ────────────────────────────────────────────────────
CREATE POLICY "users: own read"
  ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users: own update"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Public fields readable by authenticated users (for leaderboard)
CREATE POLICY "users: public profile read"
  ON public.users FOR SELECT TO authenticated
  USING (TRUE);  -- RLS will still block writes; reads are fine for name/rank

-- ── SYLLABI ──────────────────────────────────────────────────
CREATE POLICY "syllabi: own crud"
  ON public.syllabi FOR ALL USING (auth.uid() = user_id);

-- ── SECTIONS ─────────────────────────────────────────────────
CREATE POLICY "sections: own crud"
  ON public.sections FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.syllabi
      WHERE syllabi.id = sections.syllabus_id
        AND syllabi.user_id = auth.uid()
    )
  );

-- ── TOPICS ───────────────────────────────────────────────────
CREATE POLICY "topics: own crud"
  ON public.topics FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.sections s
      JOIN public.syllabi sy ON sy.id = s.syllabus_id
      WHERE s.id = topics.section_id
        AND sy.user_id = auth.uid()
    )
  );

-- ── USER_TOPIC_PROGRESS ──────────────────────────────────────
-- Strictly private — no one can see another user's progress
CREATE POLICY "utp: own only"
  ON public.user_topic_progress FOR ALL USING (auth.uid() = user_id);

-- ── REVISION_LOG ─────────────────────────────────────────────
CREATE POLICY "revision_log: own only"
  ON public.revision_log FOR ALL USING (auth.uid() = user_id);

-- ── RESOURCES ────────────────────────────────────────────────
CREATE POLICY "resources: public read or own"
  ON public.resources FOR SELECT USING (
    visibility = 'public' OR uploaded_by = auth.uid()
  );

CREATE POLICY "resources: own insert"
  ON public.resources FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "resources: own update"
  ON public.resources FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "resources: own delete"
  ON public.resources FOR DELETE USING (uploaded_by = auth.uid());

-- ── REVISION_NOTES ───────────────────────────────────────────
CREATE POLICY "revision_notes: public or own"
  ON public.revision_notes FOR SELECT USING (
    visibility = 'public' OR generated_by = auth.uid()
  );

CREATE POLICY "revision_notes: own insert"
  ON public.revision_notes FOR INSERT WITH CHECK (generated_by = auth.uid());

CREATE POLICY "revision_notes: own update/delete"
  ON public.revision_notes FOR UPDATE USING (generated_by = auth.uid());

CREATE POLICY "revision_notes: own delete"
  ON public.revision_notes FOR DELETE USING (generated_by = auth.uid());

-- ── MCQS ─────────────────────────────────────────────────────
-- All authenticated users can read MCQs (community resource)
CREATE POLICY "mcqs: authenticated read"
  ON public.mcqs FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "mcqs: own insert"
  ON public.mcqs FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "mcqs: own update/delete"
  ON public.mcqs FOR UPDATE USING (created_by = auth.uid());

-- ── TEST_ATTEMPTS ────────────────────────────────────────────
CREATE POLICY "test_attempts: own only"
  ON public.test_attempts FOR ALL USING (auth.uid() = user_id);

-- ── DISCUSSIONS ──────────────────────────────────────────────
CREATE POLICY "discussions: authenticated read"
  ON public.discussions FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "discussions: own insert"
  ON public.discussions FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "discussions: own update/delete"
  ON public.discussions FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "discussion_replies: authenticated read"
  ON public.discussion_replies FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "discussion_replies: own insert"
  ON public.discussion_replies FOR INSERT WITH CHECK (author_id = auth.uid());

-- ── SAVED_RESOURCES ──────────────────────────────────────────
CREATE POLICY "saved_resources: own only"
  ON public.saved_resources FOR ALL USING (user_id = auth.uid());

-- ── ACHIEVEMENTS ─────────────────────────────────────────────
CREATE POLICY "achievements: all can read"
  ON public.achievements FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "user_achievements: own only"
  ON public.user_achievements FOR SELECT USING (user_id = auth.uid());

-- ── STORAGE BUCKETS ──────────────────────────────────────────
-- Run these in Supabase Dashboard → Storage → New bucket, or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies (resources bucket)
CREATE POLICY "resources bucket: owner read"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'resources'
    AND (auth.uid()::text = (storage.foldername(name))[1]
         OR EXISTS (
           SELECT 1 FROM public.resources r
           WHERE r.storage_path = name AND r.visibility = 'public'
         ))
  );

CREATE POLICY "resources bucket: owner upload"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'resources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "resources bucket: owner delete"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'resources'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars bucket (public)
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars: owner upload"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
