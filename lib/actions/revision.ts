'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import {
  calculateRetentionDelta,
  calculateNewLevel,
  getNextRevisionDate,
  getSnoozeDate,
} from '@/lib/revision/schedule'

import {
  checkAndAwardAchievement,
} from './achievements'

async function updateUserRCS(
  userId: string
) {
  const supabase =
    await createClient()

  const {
    data,
  } = await supabase.rpc(
    'compute_rcs',
    {
      p_user_id:
        userId,
    }
  )

  if (data != null) {
    await supabase
      .from('users')
      .update({
        rcs_score:
          data,
      })
      .eq(
        'id',
        userId
      )
  }
}

export async function completeRevision(
  data: {
    topicId: string
    revisionLogId: string
    mcqScore?: number
  }
) {
  const supabase =
    await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user)
    return {
      error:
        'Not authenticated',
    }

  const now =
    new Date()

  const {
    data: progress,
  } =
    await supabase
      .from(
        'user_topic_progress'
      )
      .select('*')
      .eq(
        'user_id',
        user.id
      )
      .eq(
        'topic_id',
        data.topicId
      )
      .single()

  if (!progress)
    return {
      error:
        'Progress not found',
    }

  const count =
    progress.revision_count +
    1

  const retentionDelta =
    calculateRetentionDelta(
      progress.retention_score,
      data.mcqScore ?? null
    )

  const retention =
    Math.min(
      100,
      Math.max(
        0,
        progress.retention_score +
          retentionDelta
      )
    )

  const level =
    calculateNewLevel(
      progress.level,
      count,
      progress.mcq_avg_score
    )

  const nextDate =
    getNextRevisionDate(
      now,
      count
    )

  await supabase
    .from(
      'user_topic_progress'
    )
    .update({
      level,
      retention_score:
        retention,
      next_revision_at:
        nextDate?.toISOString() ??
        null,
      revision_count:
        count,
    })
    .eq(
      'user_id',
      user.id
    )
    .eq(
      'topic_id',
      data.topicId
    )

  await updateUserRCS(
    user.id
  )

  revalidatePath('/home')

  return {
    success: true,
  }
}

export async function snoozeRevision(
  data: {
    topicId: string
    revisionLogId: string
    days: 1 | 2 | 3 | 7
  }
) {
  const supabase =
    await createClient()

  const date =
    getSnoozeDate(
      data.days
    )

  await supabase
    .from(
      'revision_log'
    )
    .update({
      status:
        'snoozed',
      scheduled_for:
        date.toISOString(),
    })
    .eq(
      'id',
      data.revisionLogId
    )

  revalidatePath(
    '/home'
  )

  return {
    success: true,
  }
}