-- ============================================================
-- MedMaster AI — Migration 003: Seed Data
-- ============================================================

-- ── STORAGE BUCKETS ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('resources', 'resources', FALSE, 52428800,   -- 50MB limit
   ARRAY['application/pdf','application/vnd.ms-powerpoint',
         'application/vnd.openxmlformats-officedocument.presentationml.presentation',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'image/jpeg','image/png','image/webp','image/gif']),
  ('avatars', 'avatars', TRUE, 5242880,          -- 5MB limit
   ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ── ACHIEVEMENTS ─────────────────────────────────────────────
INSERT INTO public.achievements (key, name, description, icon, xp_reward) VALUES
  ('first_upload',        'First Upload',          'Uploaded your first study notes',                  '📄', 50),
  ('first_revision',      'First Revision',        'Completed your first scheduled revision',          '🔄', 50),
  ('first_mcq',           'First MCQ',             'Attempted your first MCQ set',                     '❓', 25),
  ('first_mastery',       'First Mastery',         'Achieved mastery on your first topic',             '🌟', 150),
  ('streak_7',            '7-Day Streak',          'Revised consistently for 7 consecutive days',      '🔥', 100),
  ('streak_30',           '30-Day Streak',         'Revised consistently for 30 consecutive days',     '⚡', 500),
  ('streak_100',          '100-Day Streak',        '100 days of consistent revision',                  '🏔️', 2000),
  ('mcqs_25',             '25 MCQs',               'Solved 25 MCQs',                                   '🎯', 75),
  ('mcqs_100',            '100 MCQs',              'Solved 100 MCQs total',                            '🎯', 200),
  ('mcqs_500',            '500 MCQs',              'Solved 500 MCQs total',                            '🏹', 750),
  ('topics_studied_10',   '10 Topics Studied',     'Studied 10 topics',                                '📚', 100),
  ('topics_studied_25',   '25 Topics Studied',     'Studied 25 topics',                                '📚', 200),
  ('topics_mastered_5',   '5 Topics Mastered',     'Mastered 5 topics',                                '🌿', 200),
  ('topics_mastered_20',  '20 Topics Mastered',    'Mastered 20 topics',                               '🌳', 600),
  ('top_contributor',     'Top Contributor',       'Reached top 10 in contributor rank',               '🤝', 300),
  ('perfect_score',       'Perfect Score',         'Scored 100% on an MCQ set',                       '💯', 75),
  ('high_rcs',            'Consistent Scholar',    'Maintained RCS above 85% for 14 days',            '📊', 250),
  ('first_discussion',    'Started a Discussion',  'Started your first topic discussion',              '💬', 30),
  ('helpful_answer',      'Helpful Answer',        'Your reply received 5+ upvotes',                   '👍', 100),
  ('master_of_jwara',     'Master of Jwara',       'Mastered all Jwara topics',                        '🌡️', 300),
  ('master_of_amavata',   'Master of Amavata',     'Mastered all Amavata topics',                      '🦵', 300)
ON CONFLICT (key) DO NOTHING;
