'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import {
  buildRevisionSchedule,
} from '@/lib/revision/schedule'

import {
  checkAndAwardAchievement,
} from './achievements'

export async function addCustomTopic(data: {
  section_id: string
  name: string
}) {
  const supabase =
    await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error:
        'Not authenticated',
    }
  }

  const {
    data: lastTopic,
  } = await supabase
    .from('topics')
    .select('sort_order')
    .eq(
      'section_id',
      data.section_id
    )
    .order(
      'sort_order',
      {
        ascending: false,
      }
    )
    .limit(1)
    .single()

  const nextSort =
    ((lastTopic as any)
      ?.sort_order ?? 0) + 1

  await supabase
    .from('topics')
    .insert({
      section_id:
        data.section_id,
      name: data.name,
      sort_order:
        nextSort,
      is_custom: true,
    })

  revalidatePath('/syllabus')

  return {
    success: true,
  }
}

export async function markTopicStudied(
  topicId: string
) {
  const supabase =
    await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error:
        'Not authenticated',
    }
  }

  const now =
    new Date()

  await supabase
    .from(
      'user_topic_progress'
    )
    .upsert({
      user_id: user.id,
      topic_id: topicId,
      level: 1,
      retention_score: 100,
      knowledge_health:
        'excellent',
      last_studied_at:
        now.toISOString(),
      next_revision_at:
        new Date(
          now.getTime() +
            7 *
              24 *
              60 *
              60 *
              1000
        ).toISOString(),
      revision_count: 0,
      is_overdue: false,
    })

  const schedule =
    buildRevisionSchedule(
      user.id,
      topicId,
      now
    )

  await supabase
    .from('revision_log')
    .insert(schedule)

  await checkAndAwardAchievement(
    user.id,
    'first_revision'
  )

  revalidatePath(
    `/topic/${topicId}`
  )

  return {
    success: true,
  }
}