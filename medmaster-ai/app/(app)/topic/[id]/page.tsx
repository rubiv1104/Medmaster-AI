import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getTopicWithSection, getTopicProgress } from '@/lib/supabase/queries/topics'
import Link from 'next/link'
import { format } from 'date-fns'
import TopicTabs from './TopicTabs'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('topics').select('name').eq('id', id).single()
  return { title: data?.name ?? 'Topic' }
}

const LEVEL_CONFIG: Record<number, { label: string; color: string; bg: string; desc: string }> = {
  0: { label: 'Not Started', color: 'var(--text-3)',    bg: 'var(--surface-2)', desc: 'Study this topic to begin your revision journey.' },
  1: { label: 'Studied',     color: 'var(--amber-800)', bg: 'var(--amber-100)', desc: 'First revision due in 7 days.' },
  2: { label: 'Completed',   color: 'var(--green-800)', bg: 'var(--green-100)', desc: 'MCQs validated. Revisions in progress.' },
  3: { label: 'Revised',     color: 'var(--green-900)', bg: 'var(--green-200)', desc: 'Multiple revisions completed.' },
  4: { label: 'Mastered',    color: '#FFFFFF',          bg: 'var(--green-800)', desc: 'All revisions complete. Topic mastered.' },
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab: activeTab = 'notes' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [topicData, progress] = await Promise.all([
    getTopicWithSection(id),
    getTopicProgress(user.id, id),
  ])

  if (!topicData) notFound()

  const section = (topicData as any).section
  const level = progress?.level ?? 0
  const levelConfig = LEVEL_CONFIG[level]

  // Fetch resources for this topic
  const { data: resources } = await supabase
    .from('resources')
    .select('*, uploaded_by_user:users(full_name)')
    .eq('topic_id', id)
    .or(`visibility.eq.public,uploaded_by.eq.${user.id}`)
    .order('save_count', { ascending: false })

  // Fetch pending revision if any
  const { data: pendingRevision } = await supabase
    .from('revision_log')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic_id', id)
    .eq('status', 'scheduled')
    .order('scheduled_for', { ascending: true })
    .limit(1)
    .single()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Hero Header ─────────────────────────────────────── */}
      <div style={{
        padding: '32px 32px 0',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
          <Link href="/syllabus" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Syllabus</Link>
          <span>›</span>
          <Link href={`/syllabus/${section?.id}`} style={{ color: 'var(--text-3)', textDecoration: 'none' }}>
            {section?.name}
          </Link>
          <span>›</span>
          <span style={{ color: 'var(--text-2)' }}>{topicData.name}</span>
        </nav>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          <div>
            <h1 style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(22px, 3.5vw, 30px)',
              fontWeight: 400, color: 'var(--text)', marginBottom: 10,
            }}>
              {topicData.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Level badge */}
              <span style={{
                padding: '5px 12px', borderRadius: 99, fontSize: 13, fontWeight: 500,
                background: levelConfig.bg, color: levelConfig.color,
              }}>
                {levelConfig.label}
              </span>

              {/* Knowledge health */}
              {progress && progress.level > 0 && (
                <span className={`badge health-${progress.knowledge_health === 'needs_revision' ? 'needs' : progress.knowledge_health}`}>
                  {progress.knowledge_health === 'not_started' ? 'Not started'
                    : progress.knowledge_health === 'needs_revision' ? 'Needs Revision'
                    : progress.knowledge_health.charAt(0).toUpperCase() + progress.knowledge_health.slice(1)}
                </span>
              )}

              {/* Revision info */}
              {progress && progress.next_revision_at && progress.level >= 1 && (
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                  Next revision: {format(new Date(progress.next_revision_at), 'MMM d, yyyy')}
                </span>
              )}

              {/* Overdue warning */}
              {progress?.is_overdue && (
                <span className="badge" style={{ background: 'var(--rose-100)', color: 'var(--rose-800)' }}>
                  ⚠ Overdue
                </span>
              )}
            </div>
          </div>

          {/* Primary action */}
          <div style={{ flexShrink: 0 }}>
            {level === 0 ? (
              <MarkStudiedButton topicId={id} />
            ) : (
              <Link
                href={`/topic/${id}?tab=revision-notes`}
                className="btn btn-primary"
              >
                🔄 Revise now
              </Link>
            )}
          </div>
        </div>

        {/* Stats row — only if started */}
        {progress && level > 0 && (
          <div style={{
            display: 'flex', gap: 24, padding: '14px 0 0',
            borderTop: '1px solid var(--border)',
            fontSize: 13,
          }}>
            <div>
              <span style={{ color: 'var(--text-3)' }}>Retention </span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{Math.round(progress.retention_score)}%</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-3)' }}>Revisions </span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{progress.revision_count} / 5</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-3)' }}>MCQ avg </span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                {progress.mcq_avg_score > 0 ? `${Math.round(progress.mcq_avg_score)}%` : '—'}
              </span>
            </div>
            {progress.last_studied_at && (
              <div>
                <span style={{ color: 'var(--text-3)' }}>Last studied </span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {format(new Date(progress.last_studied_at), 'MMM d')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      <div style={{ padding: '0 32px 64px' }}>
        <TopicTabs
          topicId={id}
          topicName={topicData.name}
          userId={user.id}
          activeTab={activeTab}
          resources={resources ?? []}
          progress={progress}
          pendingRevisionId={pendingRevision?.id ?? null}
          level={level}
        />
      </div>
    </div>
  )
}

// Server-rendered button that triggers client-side action
function MarkStudiedButton({ topicId }: { topicId: string }) {
  return (
    <form>
      <MarkStudiedClientButton topicId={topicId} />
    </form>
  )
}

// We need a client button for the action — split into client component
import MarkStudiedClientButton from './MarkStudiedButton'
