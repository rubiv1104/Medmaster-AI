'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import {
  checkAndAwardAchievement,
} from './achievements'

export async function createResourceRecord(
  data: {
    topicId: string
    title: string
    fileType: string
    storagePath: string
    fileSizeBytes: number
    visibility:
      | 'public'
      | 'private'
  }
) {
  const supabase =
    await createClient()

  const {
    data: { user },
  } =
    await supabase.auth.getUser()

  if (!user)
    return {
      error:
        'Not authenticated',
    }

  const {
    data: resource,
    error,
  } =
    await supabase
      .from(
        'resources'
      )
      .insert({
        topic_id:
          data.topicId,
        uploaded_by:
          user.id,
        title:
          data.title,
        file_type:
          data.fileType,
        storage_path:
          data.storagePath,
        file_size_bytes:
          data.fileSizeBytes,
        visibility:
          data.visibility,
      })
      .select()
      .single()

  if (error)
    return {
      error:
        error.message,
    }

  await checkAndAwardAchievement(
    user.id,
    'first_upload'
  )

  revalidatePath(
    `/topic/${data.topicId}`
  )

  return {
    success: true,
    resource,
  }
}