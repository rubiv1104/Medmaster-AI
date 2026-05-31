'use server'

// ============================================================
// MedMaster AI — Server Actions (Phase 1)
// All data mutations happen here — never in client components
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getBranchTemplate } from '@/lib/syllabus-templates'
import {
  buildRevisionSchedule,
  calculateRetentionDelta,
  calculateNewLevel,
  getNextRevisionDate,
  getSnoozeDate,
} from '@/lib/revision/schedule'

// ── Auth ─────────────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  redirect('/home')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  })
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ── Onboarding ───────────────────────────────────────────────

export async function completeOnboarding(data: {
  college: string
  branch: string
  batch_year: number
  full_name: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const template = getBranchTemplate(data.branch)
  if (!template) return { error: 'Invalid branch selected' }

  // 1. Update user profile
  const { error: profileError } = await supabase
    .from('users')
    .update({
      full_name: data.full_name,
      college: data.college,
      branch: data.branch,
      batch_year: data.batch_year,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  if (profileError) return { error: profileError.message }

  // 2. Create syllabus
  const { data: syllabus, error: syllabusError } = await supabase
    .from('syllabi')
    .insert({
      user_id: user.id,
      name: template.syllabus_name,
      branch: data.branch,
      is_active: true,
    })
    .select()
    .single()

  if (syllabusError || !syllabus) return { error: syllabusError?.message ?? 'Failed to create syllabus' }

  // 3. Create sections and topics from template
  for (const sectionTemplate of template.sections) {
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .insert({
        syllabus_id: syllabus.id,
        name: sectionTemplate.name,
        sort_order: sectionTemplate.sort_order,
      })
      .select()
      .single()

    if (sectionError || !section) continue

    // Batch insert topics for this section
    const topicsToInsert = sectionTemplate.topics.map(t => ({
      section_id: section.id,
      name: t.name,
      sort_order: t.sort_order,
      is_custom: false,
    }))

    await supabase.from('topics').insert(topicsToInsert)
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

// ── Topics ───────────────────────────────────────────────────

export async function addCustomTopic(data: {
  section_id: string
  name: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify user owns this section
  const { data: section } = await supabase
    .from('sections')
    .select('syllabus_id, syllabi(user_id)')
    .eq('id', data.section_id)
    .single()

  if (!section || (section.syllabi as any)?.user_id !== user.id) {
    return { error: 'Access denied' }
  }

  // Get max sort_order in this section
  const { data: lastTopic } = await supabase
    .from('topics')
    .select('sort_order')
    .eq('section_id', data.section_id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextSortOrder = ((lastTopic as any)?.sort_order ?? 0) + 1

  const { error } = await supabase.from('topics').insert({
    section_id: data.section_id,
    name: data.name,
    sort_order: nextSortOrder,
    is_custom: true,
  })

  if (error) return { error: error.message }

  revalidatePath('/syllabus')
  return { success: true }
}

// ── Mark Topic as Studied ────────────────────────────────────

export async function markTopicStudied(topicId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const now = new Date()

  // Upsert user_topic_progress
  const { error: progressError } = await supabase
    .from('user_topic_progress')
    .upsert({
      user_id: user.id,
      topic_id: topicId,
      level: 1,
      retention_score: 100,
      knowledge_health: 'excellent',
      last_studied_at: now.toISOString(),
      next_revision_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Day 7
      revision_count: 0,
      is_overdue: false,
    }, {
      onConflict: 'user_id,topic_id',
      ignoreDuplicates: false,
    })

  if (progressError) return { error: progressError.message }

  // Create revision schedule (Day 7, 14, 21, 45, 90)
  const schedule = buildRevisionSchedule(user.id, topicId, now)

  // Delete existing scheduled revisions for this topic (if re-studying)
  await supabase
    .from('revision_log')
    .delete()
    .eq('user_id', user.id)
    .eq('topic_id', topicId)
    .eq('status', 'scheduled')

  const { error: scheduleError } = await supabase
    .from('revision_log')
    .insert(schedule)

  if (scheduleError) return { error: scheduleError.message }

  // Award first_upload achievement check (handled via achievement helper below)
  await checkAndAwardAchievement(user.id, 'first_revision')

  revalidatePath(`/topic/${topicId}`)
  revalidatePath('/home')
  return { success: true }
}

// ── Complete Revision ────────────────────────────────────────

export async function completeRevision(data: {
  topicId: string
  revisionLogId: string
  mcqScore?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const now = new Date()

  // Get current progress
  const { data: progress } = await supabase
    .from('user_topic_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic_id', data.topicId)
    .single()

  if (!progress) return { error: 'Progress not found' }

  const newRevisionCount = progress.revision_count + 1
  const retentionDelta = calculateRetentionDelta(progress.retention_score, data.mcqScore ?? null)
  const newRetention = Math.min(100, Math.max(0, progress.retention_score + retentionDelta))

  const newMcqAvg = data.mcqScore != null
    ? ((progress.mcq_avg_score * progress.revision_count) + data.mcqScore) / newRevisionCount
    : progress.mcq_avg_score

  const newLevel = calculateNewLevel(progress.level, newRevisionCount, newMcqAvg)
  const nextRevisionDate = getNextRevisionDate(now, newRevisionCount)

  const newKnowledgeHealth =
    newRetention >= 80 ? 'excellent'
    : newRetention >= 60 ? 'good'
    : newRetention >= 40 ? 'needs_revision'
    : 'at_risk'

  // Update progress
  await supabase
    .from('user_topic_progress')
    .update({
      level: newLevel,
      retention_score: newRetention,
      knowledge_health: newKnowledgeHealth,
      last_studied_at: now.toISOString(),
      next_revision_at: nextRevisionDate?.toISOString() ?? null,
      revision_count: newRevisionCount,
      mcq_avg_score: newMcqAvg,
      snooze_count: 0,
      is_overdue: false,
    })
    .eq('user_id', user.id)
    .eq('topic_id', data.topicId)

  // Mark this revision as completed
  await supabase
    .from('revision_log')
    .update({
      status: 'completed',
      completed_at: now.toISOString(),
      mcq_score: data.mcqScore ?? null,
      retention_delta: retentionDelta,
    })
    .eq('id', data.revisionLogId)

  // Update RCS score
  await updateUserRCS(user.id)

  // Achievement checks
  if (newLevel === 4) await checkAndAwardAchievement(user.id, 'first_mastery')
  if (newRevisionCount === 1) await checkAndAwardAchievement(user.id, 'first_revision')
  if (data.mcqScore === 100) await checkAndAwardAchievement(user.id, 'perfect_score')

  revalidatePath(`/topic/${data.topicId}`)
  revalidatePath('/home')
  return { success: true, newLevel, newRetention, nextRevisionDate }
}

// ── Snooze Revision ──────────────────────────────────────────

export async function snoozeRevision(data: {
  topicId: string
  revisionLogId: string
  days: 1 | 2 | 3 | 7
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const snoozeDate = getSnoozeDate(data.days)

  // Update revision_log status
  await supabase
    .from('revision_log')
    .update({
      status: 'snoozed',
      scheduled_for: snoozeDate.toISOString(),
    })
    .eq('id', data.revisionLogId)

  // Update next_revision_at in progress
  const { data: progress } = await supabase
    .from('user_topic_progress')
    .select('snooze_count')
    .eq('user_id', user.id)
    .eq('topic_id', data.topicId)
    .single()

  await supabase
    .from('user_topic_progress')
    .update({
      next_revision_at: snoozeDate.toISOString(),
      snooze_count: ((progress as any)?.snooze_count ?? 0) + 1,
    })
    .eq('user_id', user.id)
    .eq('topic_id', data.topicId)

  revalidatePath('/home')
  return { success: true }
}

// ── Resources ────────────────────────────────────────────────

export async function createResourceRecord(data: {
  topicId: string
  title: string
  fileType: string
  storagePath: string
  fileSizeBytes: number
  visibility: 'public' | 'private'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: resource, error } = await supabase
    .from('resources')
    .insert({
      topic_id: data.topicId,
      uploaded_by: user.id,
      title: data.title,
      file_type: data.fileType as any,
      storage_path: data.storagePath,
      file_size_bytes: data.fileSizeBytes,
      visibility: data.visibility,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Award achievement
  await checkAndAwardAchievement(user.id, 'first_upload')

  revalidatePath(`/topic/${data.topicId}`)
  return { success: true, resource }
}

// ── RCS Update ───────────────────────────────────────────────

async function updateUserRCS(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.rpc('compute_rcs', { p_user_id: userId })
  if (data != null) {
    await supabase
      .from('users')
      .update({ rcs_score: data })
      .eq('id', userId)
  }
}

// ── Achievements ─────────────────────────────────────────────

async function checkAndAwardAchievement(userId: string, achievementKey: string) {
  const supabase = await createClient()

  const { data: achievement } = await supabase
    .from('achievements')
    .select('id, xp_reward')
    .eq('key', achievementKey)
    .single()

  if (!achievement) return

  // Check if already earned
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_id', achievement.id)
    .single()

  if (existing) return // Already earned

  // Award it
  await supabase.from('user_achievements').insert({
    user_id: userId,
    achievement_id: achievement.id,
  })

  // Add XP
  if (achievement.xp_reward > 0) {
    await supabase.rpc('increment_xp', {
      p_user_id: userId,
      p_amount: achievement.xp_reward,
    })
  }
}
