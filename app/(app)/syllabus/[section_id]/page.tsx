import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getAllUserProgress } from '@/lib/supabase/queries/topics'
import Link from 'next/link'
import type { Topic, UserTopicProgress, KnowledgeHealth } from '@/types/database'
import { LEVEL_LABELS } from '@/lib/revision/schedule'
import { format } from 'date-fns'
import AddCustomTopicForm from './AddCustomTopicForm'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ section_id: string }> }): Promise<Metadata> {
  const { section_id } = await params
  const supabase = await createClient()
  const { data: section } = await supabase.from('sections').select('name').eq('id', section_id).single()
  return { title: section?.name ?? 'Section' }
}

const HEALTH_COLORS: Record<KnowledgeHealth | 'not_started', string> = {
  not_started:    'var(--border-strong)',
  excellent:      'var(--green-400)',
  good:           '#74D0A0',
  needs_revision: 'var(--amber-400)',
  at_risk:        'var(--rose-400)',
}

function TopicRow({ topic, progress }: { topic: Topic; progress: UserTopicProgress | null }) {
  const level = progress?.level ?? 0
  const health = progress?.knowledge_health ?? 'not_started'
  const levelLabel = LEVEL_LABELS[level]

  return (
    <Link
      href={`/topic/${topic.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          transition: 'background 0.15s ease',
          background: 'var(--surface)',
          cursor: 'pointer',
        }}
        className="topic-row"
      >
        {/* Health dot */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
          background: HEALTH_COLORS[health],
          boxShadow: level > 0 ? `0 0 0 3px ${HEALTH_COLORS[health]}22` : 'none',
        }} />

        {/* Topic name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 15, fontWeight: level > 0 ? 500 : 400,
            color: level === 0 ? 'var(--text-2)' : 'var(--text)',
            marginBottom: 2, lineHeight: 1.3,
          }}>
            {topic.name}
            {topic.is_custom && (
              <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>custom</span>
            )}
          </p>
          {progress && progress.next_revision_at && level >= 1 && (
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Next revision: {format(new Date(progress.next_revision_at), 'MMM d')}
              {progress.is_overdue && <span style={{ color: 'var(--rose-800)', marginLeft: 4 }}>· Overdue</span>}
            </p>
          )}
        </div>

        {/* Level badge */}
        <span className={`badge level-${level}`} style={{ fontSize: 12, flexShrink: 0 }}>
          {levelLabel}
        </span>

        {/* Retention ring — only if studied */}
        {progress && level >= 1 && (
          <div style={{ flexShrink: 0 }}>
            <RetentionMini score={progress.retention_score} />
          </div>
        )}

        <span style={{ color: 'var(--text-3)', fontSize: 14, flexShrink: 0 }}>→</span>
      </div>
    </Link>
  )
}

function RetentionMini({ score }: { score: number }) {
  const r = 10
  const circ = 2 * Math.PI * r
  const color = score >= 80 ? 'var(--green-400)' : score >= 60 ? '#74D0A0' : score >= 40 ? 'var(--amber-400)' : 'var(--rose-400)'
  return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="3" />
      <circle cx="14" cy="14" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
        strokeLinecap="round" transform="rotate(-90 14 14)" />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 8, fill: color, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
        {Math.round(score)}
      </text>
    </svg>
  )
}

export default async function SectionPage({ params }: { params: Promise<{ section_id: string }> }) {
  const { section_id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch section + verify ownership
  const { data: section } = await supabase
    .from('sections')
    .select('*, syllabi(name, user_id, branch)')
    .eq('id', section_id)
    .single()

  if (!section || (section.syllabi as any)?.user_id !== user.id) notFound()

  // Fetch topics
  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('section_id', section_id)
    .order('sort_order')

  const progressMap = await getAllUserProgress(user.id)

  const topicsWithProgress = (topics ?? []).map(t => ({
    ...t,
    progress: progressMap[t.id] ?? null,
  }))

  const studied  = topicsWithProgress.filter(t => t.progress && t.progress.level >= 1).length
  const mastered = topicsWithProgress.filter(t => t.progress && t.progress.level === 4).length
  const overdue  = topicsWithProgress.filter(t => t.progress?.is_overdue).length

  return (
    <div style={{ padding: '40px 32px 64px', maxWidth: 800, margin: '0 auto' }}>

      {/* Breadcrumb */}
      <nav style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
        <Link href="/syllabus" style={{ color: 'var(--text-3)', textDecoration: 'none' }}>Syllabus</Link>
        <span>›</span>
        <span style={{ color: 'var(--text-2)' }}>{section.name}</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: 28 }} className="animate-fade-in">
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 400, marginBottom: 8 }}>
          {section.name}
        </h1>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-3)' }}>
          <span>{topics?.length ?? 0} topics</span>
          <span>{studied} studied</span>
          {mastered > 0 && <span style={{ color: 'var(--green-800)' }}>{mastered} mastered</span>}
          {overdue > 0 && <span style={{ color: 'var(--rose-800)' }}>{overdue} overdue</span>}
        </div>
      </div>

      {/* Topics list */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
          marginBottom: 20,
        }}
        className="animate-slide-up"
      >
        {/* Legend */}
        <div style={{
          padding: '10px 18px', borderBottom: '1px solid var(--border)',
          display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-3)',
          background: 'var(--surface-2)',
        }}>
          {[
            { color: 'var(--border-strong)', label: 'Not started' },
            { color: '#B0E8CA', label: 'Studied' },
            { color: 'var(--green-400)', label: 'Completed / Revised' },
            { color: 'var(--green-800)', label: 'Mastered' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>

        {topicsWithProgress.length === 0 ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-3)' }}>
            No topics yet.
          </div>
        ) : (
          topicsWithProgress.map(topic => (
            <TopicRow key={topic.id} topic={topic} progress={topic.progress} />
          ))
        )}
      </div>

      {/* Add custom topic */}
      <AddCustomTopicForm sectionId={section_id} />

      <style>{`.topic-row:hover { background: var(--surface-2) !important; }`}</style>
    </div>
  )
}
