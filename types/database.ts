// ============================================================
// MedMaster AI — Production Database Types (Supabase-safe)
// ============================================================


// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

type Nullable<T> = T | null

// ────────────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────────────

export type KnowledgeHealth =
  | 'not_started'
  | 'excellent'
  | 'good'
  | 'needs_revision'
  | 'at_risk'

export type TopicLevel = 0 | 1 | 2 | 3 | 4
export type ResourceVisibility = 'public' | 'private'
export type RevisionStatus = 'scheduled' | 'completed' | 'snoozed' | 'overdue'
export type FileType = 'pdf' | 'ppt' | 'pptx' | 'docx' | 'image' | 'other'
export type Difficulty = 'easy' | 'moderate' | 'hard'
export type MCQSource = 'ai' | 'manual'
export type TestContext = 'revision' | 'quick_mcq' | 'recall_challenge' | 'onboarding'
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

// ────────────────────────────────────────────────────────────
// Tables
// ────────────────────────────────────────────────────────────

// USERS
export interface User {
  id: string
  email: string
  full_name: Nullable<string>
  college: Nullable<string>
  branch: Nullable<string>
  batch_year: Nullable<number>
  avatar_url: Nullable<string>

  xp_total: number
  academic_rank_score: number
  contributor_rank_score: number
  rcs_score: number
  onboarding_completed: boolean

  created_at: string
  updated_at: string
}

// SYLLABUS
export interface Syllabus {
  id: string
  user_id: string
  name: string
  branch: string
  is_active: boolean
  created_at: string
}

// SECTION
export interface Section {
  id: string
  syllabus_id: string
  name: string
  sort_order: number
  created_at: string
}

// TOPIC
export interface Topic {
  id: string
  section_id: string
  name: string
  is_custom: boolean
  sort_order: number
  created_at: string
}

// USER TOPIC PROGRESS
export interface UserTopicProgress {
  id: string
  user_id: string
  topic_id: string

  level: TopicLevel
  retention_score: number
  knowledge_health: KnowledgeHealth

  last_studied_at: Nullable<string>
  next_revision_at: Nullable<string>

  revision_count: number
  mcq_avg_score: number
  snooze_count: number
  is_overdue: boolean

  created_at: string
  updated_at: string
}

// REVISION LOG
export interface RevisionLog {
  id: string
  user_id: string
  topic_id: string

  scheduled_for: string
  completed_at: Nullable<string>
  status: RevisionStatus

  mcq_score: Nullable<number>
  retention_delta: number
  revision_number: number

  created_at: string
}

// RESOURCE
export interface Resource {
  id: string
  topic_id: string
  uploaded_by: string

  title: string
  file_type: Nullable<FileType>
  storage_path: string
  file_size_bytes: Nullable<number>

  visibility: ResourceVisibility
  save_count: number
  upvote_count: number

  ai_processed: boolean
  processing_status: ProcessingStatus

  created_at: string
}

// REVISION NOTE
export interface RevisionNote {
  id: string
  topic_id: string
  resource_id: Nullable<string>

  generated_by: string
  content: string
  model_used: Nullable<string>

  visibility: ResourceVisibility
  save_count: number

  created_at: string
}

// MCQ OPTION
export interface MCQOption {
  label: 'A' | 'B' | 'C' | 'D'
  text: string
}

// MCQ
export interface MCQ {
  id: string
  topic_id: string
  resource_id: Nullable<string>

  created_by: string
  question: string

  options: MCQOption[]
  correct_option: 'A' | 'B' | 'C' | 'D'

  explanation: Nullable<string>
  difficulty: Difficulty
  source: MCQSource

  upvote_count: number
  is_verified: boolean

  created_at: string
}

// TEST ATTEMPT
export interface TestAttempt {
  id: string
  user_id: string
  topic_id: string

  mcq_ids: string[]
  answers: Record<string, string>

  score: number
  context: TestContext

  attempted_at: string
}

// DISCUSSION
export interface Discussion {
  id: string
  topic_id: string
  author_id: string

  title: string
  body: string

  upvote_count: number
  reply_count: number

  created_at: string
  updated_at: string
}

// DISCUSSION REPLY
export interface DiscussionReply {
  id: string
  discussion_id: string
  author_id: string

  body: string
  upvote_count: number

  created_at: string
}

// SAVED RESOURCE
export interface SavedResource {
  id: string
  user_id: string
  resource_id: string
  created_at: string
}

// ACHIEVEMENT
export interface Achievement {
  id: string
  key: string
  name: string
  description: Nullable<string>
  icon: Nullable<string>
  xp_reward: number
  created_at: string
}

// USER ACHIEVEMENT
export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
}

// ────────────────────────────────────────────────────────────
// Joined Types (UI Layer)
// ────────────────────────────────────────────────────────────

export interface TopicWithProgress extends Topic {
  progress: Nullable<UserTopicProgress>
}

export interface SectionWithTopics extends Section {
  topics: TopicWithProgress[]
}

export interface SyllabusWithSections extends Syllabus {
  sections: SectionWithTopics[]
}

export interface RevisionDue {
  topic: Topic
  progress: UserTopicProgress
  revision: RevisionLog
  section_name: string
}

// ────────────────────────────────────────────────────────────
// Supabase Database Type Map (PRODUCTION SAFE)
// ────────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<
          User,
          'created_at' | 'updated_at'
        >
        Update: Partial<Omit<User, 'id'>>
      }

      syllabi: {
        Row: Syllabus
        Insert: Omit<Syllabus, 'created_at'>
        Update: Partial<Omit<Syllabus, 'id'>>
      }

      sections: {
        Row: Section
        Insert: Omit<Section, 'created_at'>
        Update: Partial<Omit<Section, 'id'>>
      }

      topics: {
        Row: Topic
        Insert: Omit<Topic, 'created_at'>
        Update: Partial<Omit<Topic, 'id'>>
      }

      user_topic_progress: {
        Row: UserTopicProgress
        Insert: Omit<
          UserTopicProgress,
          'created_at' | 'updated_at'
        >
        Update: Partial<
          Omit<UserTopicProgress, 'id' | 'user_id' | 'topic_id'>
        >
      }

      revision_log: {
        Row: RevisionLog
        Insert: Omit<RevisionLog, 'created_at'>
        Update: Partial<Omit<RevisionLog, 'id'>>
      }

      resources: {
        Row: Resource
        Insert: Omit<Resource, 'created_at'>
        Update: Partial<Omit<Resource, 'id'>>
      }

      revision_notes: {
        Row: RevisionNote
        Insert: Omit<RevisionNote, 'created_at'>
        Update: Partial<Omit<RevisionNote, 'id'>>
      }

      mcqs: {
        Row: MCQ
        Insert: Omit<MCQ, 'created_at'>
        Update: Partial<Omit<MCQ, 'id'>>
      }

      test_attempts: {
        Row: TestAttempt
        Insert: Omit<TestAttempt, 'attempted_at'>
        Update: never
      }

      discussions: {
        Row: Discussion
        Insert: Omit<
          Discussion,
          'created_at' | 'updated_at'
        >
        Update: Partial<Omit<Discussion, 'id'>>
      }

      discussion_replies: {
        Row: DiscussionReply
        Insert: Omit<DiscussionReply, 'created_at'>
        Update: Partial<Omit<DiscussionReply, 'id'>>
      }

      saved_resources: {
        Row: SavedResource
        Insert: SavedResource
        Update: never
      }

      achievements: {
        Row: Achievement
        Insert: Omit<Achievement, 'created_at'>
        Update: never
      }

      user_achievements: {
        Row: UserAchievement
        Insert: UserAchievement
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: {
      compute_rcs: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_xp: {
        Args: { p_user_id: string; p_amount: number }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
