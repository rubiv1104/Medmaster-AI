'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getBranchTemplate } from '@/lib/syllabus-templates'

export async function completeOnboarding(data: {
  college: string
  branch: string
  batch_year: number
  full_name: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const template =
    getBranchTemplate(data.branch)

  if (!template) {
    return { error: 'Invalid branch selected' }
  }

  await supabase
    .from('users')
    .update({
      full_name: data.full_name,
      college: data.college,
      branch: data.branch,
      batch_year: data.batch_year,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  const { data: syllabus } =
    await supabase
      .from('syllabi')
      .insert({
        user_id: user.id,
        name: template.syllabus_name,
        branch: data.branch,
        is_active: true,
      })
      .select()
      .single()

  if (!syllabus) {
    return {
      error: 'Failed to create syllabus',
    }
  }

  for (const sectionTemplate of template.sections) {
    const { data: section } =
      await supabase
        .from('sections')
        .insert({
          syllabus_id: syllabus.id,
          name: sectionTemplate.name,
          sort_order:
            sectionTemplate.sort_order,
        })
        .select()
        .single()

    if (!section) continue

    await supabase
      .from('topics')
      .insert(
        sectionTemplate.topics.map(
          (t) => ({
            section_id: section.id,
            name: t.name,
            sort_order: t.sort_order,
            is_custom: false,
          })
        )
      )
  }

  revalidatePath('/', 'layout')

  redirect('/home')
}