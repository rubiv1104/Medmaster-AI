import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  getActiveSyllabus,
  getSectionsWithProgress,
} from '@/lib/supabase/queries/topics'
import UploadWorkspace from '@/components/upload/UploadWorkspace'

export const metadata: Metadata = { title: 'Upload' }

export default async function UploadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const syllabus = await getActiveSyllabus(user.id)
  const sections = syllabus
    ? await getSectionsWithProgress(user.id, syllabus.id)
    : []

  return (
    <div style={{ padding: '40px 32px 64px', maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: 30 }} className="animate-fade-in">
        <h1 style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 'clamp(26px, 4vw, 34px)',
          fontWeight: 400,
          color: 'var(--text)',
          marginBottom: 8,
        }}>
          Upload study material
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: '58ch', lineHeight: 1.6 }}>
          Add PDFs, documents, slides, or images to a syllabus topic so your study data is stored in the right place.
        </p>
      </div>

      <UploadWorkspace sections={sections} userId={user.id} />
    </div>
  )
}
