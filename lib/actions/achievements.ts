'use server'

import { createClient } from '@/lib/supabase/server'

export async function checkAndAwardAchievement(
  userId: string,
  achievementKey: string
) {
  const supabase =
    await createClient()

  const {
    data: achievement,
  } = await supabase
    .from('achievements')
    .select('id,xp_reward')
    .eq('key', achievementKey)
    .single()

  if (!achievement) return

  const {
    data: existing,
  } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq(
      'achievement_id',
      achievement.id
    )
    .single()

  if (existing) return

  await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id:
        achievement.id,
    })

  if (achievement.xp_reward > 0) {
    await supabase.rpc(
      'increment_xp',
      {
        p_user_id: userId,
        p_amount:
          achievement.xp_reward,
      }
    )
  }
}