// ============================================================
// MedMaster AI — Topic & Syllabus Queries
// ============================================================

import { createClient } from '@/lib/supabase/server'
import type {
  Syllabus,
  Section,
  Topic,
  UserTopicProgress,
  SectionWithTopics,
  TopicWithProgress,
  RevisionDue,
} from '@/types/database'

// ── Syllabus ────────────────────────────────────────────────

export async function getActiveSyllabus(userId: string): Promise<Syllabus | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('syllabi')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function getSyllabusWithSections(syllabusId: string): Promise<SectionWithTopics[]> {
  const supabase = await createClient()

  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('syllabus_id', syllabusId)
    .order('sort_order')

  if (!sections) return []

  const sectionsWithTopics: SectionWithTopics[] = await Promise.all(
    sections.map(async (section: Section) => {
      const { data: topics } = await supabase
        .from('topics')
        .select('*')
        .eq('section_id', section.id)
        .order('sort_order')

      return {
        ...section,
        topics: (topics ?? []).map((t: Topic) => ({ ...t, progress: null })),
      }
    })
  )

  return sectionsWithTopics
}

// ── Topic Progress ───────────────────────────────────────────

export async function getTopicProgress(
  userId: string,
  topicId: string
): Promise<UserTopicProgress | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_topic_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .single()
  return data
}

export async function getAllUserProgress(
  userId: string
): Promise<Record<string, UserTopicProgress>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_topic_progress')
    .select('*')
    .eq('user_id', userId)

  const map: Record<string, UserTopicProgress> = {}
  for (const row of data ?? []) {
    map[row.topic_id] = row
  }
  return map
}

export async function getSectionsWithProgress(
  userId: string,
  syllabusId: string
): Promise<SectionWithTopics[]> {
  const sections = await getSyllabusWithSections(syllabusId)
  const progressMap = await getAllUserProgress(userId)

  return sections.map(section => ({
    ...section,
    topics: section.topics.map(topic => ({
      ...topic,
      progress: progressMap[topic.id] ?? null,
    })),
  }))
}

export async function getTopicById(topicId: string): Promise<Topic | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()
  return data
}

export async function getTopicWithSection(topicId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('topics')
    .select(`
      *,
      section:sections(
        id,
        name,
        syllabus_id
      )
    `)
    .eq('id', topicId)
    .single()
  return data
}

// ── Revisions Due ────────────────────────────────────────────

export async function getRevisionsDueToday(userId: string): Promise<RevisionDue[]> {
  const supabase = await createClient()

  // Fetch all user progress where next_revision_at <= now + 1 day buffer
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: progressRows } = await supabase
    .from('user_topic_progress')
    .select('*')
    .eq('user_id', userId)
    .gte('level', 1)                              // must have been studied
    .lte('next_revision_at', tomorrow.toISOString())
    .not('next_revision_at', 'is', null)
    .order('next_revision_at', { ascending: true })
    .limit(20)

  if (!progressRows || progressRows.length === 0) return []

  // Fetch topic data + revision log entries
  const topicIds = progressRows.map(p => p.topic_id)

  const { data: topics } = await supabase
    .from('topics')
    .select('*, section:sections(name)')
    .in('id', topicIds)

  const { data: revisions } = await supabase
    .from('revision_log')
    .select('*')
    .eq('user_id', userId)
    .in('topic_id', topicIds)
    .eq('status', 'scheduled')

  const topicMap = Object.fromEntries((topics ?? []).map((t: any) => [t.id, t]))
  const revisionMap = Object.fromEntries((revisions ?? []).map((r: any) => [r.topic_id, r]))

  const result: RevisionDue[] = []
  for (const progress of progressRows) {
    const topic = topicMap[progress.topic_id]
    const revision = revisionMap[progress.topic_id]
    if (!topic) continue
    result.push({
      topic,
      progress: progress as UserTopicProgress,
      revision,
      section_name: (topic as any).section?.name ?? '',
    })
  }

  return result
}

export async function getRevisionsDueForQuickMode(
  userId: string,
  minutes: number
): Promise<RevisionDue[]> {
  const all = await getRevisionsDueToday(userId)

  // Estimate: each topic revision takes ~5 minutes, quick MCQ set ~3 minutes
  const topicsCanFit = Math.floor(minutes / 5)
  return all.slice(0, Math.max(1, topicsCanFit))
}

// ── Stats for Academic Snapshot ─────────────────────────────

export async function getUserStats(userId: string) {
  const supabase = await createClient()

  const [
    { data: user },
    { count: totalTopics },
    { count: studiedTopics },
    { count: masteredTopics },
    { count: overdueCount },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('user_topic_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('user_topic_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('level', 1),
    supabase.from('user_topic_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('level', 4),
    supabase.from('user_topic_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_overdue', true),
  ])

  return {
    user,
    totalTopics: totalTopics ?? 0,
    studiedTopics: studiedTopics ?? 0,
    masteredTopics: masteredTopics ?? 0,
    overdueCount: overdueCount ?? 0,
  }
}
