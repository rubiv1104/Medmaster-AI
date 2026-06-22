import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveSyllabus, getSectionsWithProgress } from '@/lib/supabase/queries/topics'
import Link from 'next/link'
import { format, subDays } from 'date-fns'
import type { Metadata } from 'next'
import type { KnowledgeHealth } from '@/types/database'

export const metadata: Metadata = { title: 'Progress' }

const HEALTH_CONFIG: Record<KnowledgeHealth, { label: string; color: string; bg: string }> = {
  not_started:    { label: 'Not started',    color: 'var(--text-3)',    bg: 'var(--surface-2)' },
  excellent:      { label: 'Excellent',      color: 'var(--green-900)', bg: 'var(--green-100)' },
  good:           { label: 'Good',           color: 'var(--green-800)', bg: '#D4EEDB' },
  needs_revision: { label: 'Needs Revision', color: 'var(--amber-800)', bg: 'var(--amber-100)' },
  at_risk:        { label: 'At Risk',        color: 'var(--rose-800)',  bg: 'var(--rose-100)' },
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const syllabus = await getActiveSyllabus(user.id)

  // Fetch revision history — last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
  const { data: recentRevisions } = await supabase
    .from('revision_log')
    .select('*, topic:topics(name, section:sections(name))')
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })
    .limit(30)

  // Health distribution
  const { data: healthCounts } = await supabase
    .from('user_topic_progress')
    .select('knowledge_health')
    .eq('user_id', user.id)

  const healthDist: Record<KnowledgeHealth, number> = {
    not_started: 0, excellent: 0, good: 0, needs_revision: 0, at_risk: 0,
  }
  for (const row of healthCounts ?? []) {
    const h = row.knowledge_health as KnowledgeHealth
    if (h in healthDist) healthDist[h]++
  }

  // Top performing topics (highest retention)
  const { data: topTopics } = await supabase
    .from('user_topic_progress')
    .select('*, topic:topics(name, section:sections(name))')
    .eq('user_id', user.id)
    .gte('level', 1)
    .order('retention_score', { ascending: false })
    .limit(5)

  // Topics needing attention (lowest retention, studied)
  const { data: weakTopics } = await supabase
    .from('user_topic_progress')
    .select('*, topic:topics(name, section:sections(name))')
    .eq('user_id', user.id)
    .gte('level', 1)
    .order('retention_score', { ascending: true })
    .limit(5)

  // User stats
  const { data: profile } = await supabase
    .from('users')
    .select('rcs_score, xp_total, full_name')
    .eq('id', user.id)
    .single()

  const totalStudied = (healthCounts ?? []).filter(h => h.knowledge_health !== 'not_started').length

  // Completed revisions this week
  const weekAgo = subDays(new Date(), 7).toISOString()
  const { count: revisionsThisWeek } = await supabase
    .from('revision_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', weekAgo)

  return (
    <div style={{ padding: '40px 32px 64px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 6 }}>
          Progress
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
          Your knowledge health and revision history.
        </p>
      </div>

      {/* RCS + key stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          {
            label: 'RCS Score',
            value: `${Math.round(profile?.rcs_score ?? 0)}%`,
            sub: 'Revision Consistency',
            icon: '📊',
            highlight: true,
          },
          {
            label: 'This Week',
            value: revisionsThisWeek ?? 0,
            sub: 'revisions completed',
            icon: '🔄',
          },
          {
            label: 'Topics Studied',
            value: totalStudied,
            sub: 'with revision schedule',
            icon: '📚',
          },
          {
            label: 'XP Earned',
            value: profile?.xp_total ?? 0,
            sub: 'total experience',
            icon: '⚡',
          },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: stat.highlight
                ? 'linear-gradient(135deg, var(--green-900), var(--green-800))'
                : 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 26, fontWeight: 400,
              color: stat.highlight ? '#fff' : 'var(--text)',
              marginBottom: 3,
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: stat.highlight ? 'rgba(255,255,255,0.65)' : 'var(--text-3)' }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Knowledge Health Distribution */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '20px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <p className="section-label" style={{ marginBottom: 16 }}>Knowledge Health</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(Object.entries(HEALTH_CONFIG) as [KnowledgeHealth, typeof HEALTH_CONFIG[KnowledgeHealth]][])
              .filter(([k]) => k !== 'not_started')
              .map(([key, config]) => {
                const count = healthDist[key]
                const pct = totalStudied > 0 ? Math.round((count / totalStudied) * 100) : 0
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span className="badge" style={{ background: config.bg, color: config.color, fontSize: 11 }}>
                          {config.label}
                        </span>
                      </span>
                      <span style={{ color: 'var(--text-3)' }}>{count} topics</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: config.color,
                        borderRadius: 99, transition: 'width 0.8s ease',
                        opacity: 0.8,
                      }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Topics needing attention */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '20px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <p className="section-label" style={{ marginBottom: 16 }}>Needs Attention</p>
          {(weakTopics ?? []).length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>No topics to review — great work!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {(weakTopics ?? []).map((row: any, i: number) => (
                <Link
                  key={row.id}
                  href={`/topic/${row.topic_id}?tab=revision-notes`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < (weakTopics ?? []).length - 1 ? '1px solid var(--border)' : 'none',
                    textDecoration: 'none',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                      {row.topic?.name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{row.topic?.section?.name}</p>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: row.retention_score < 40 ? 'var(--rose-800)' : 'var(--amber-800)',
                  }}>
                    {Math.round(row.retention_score)}%
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent revision history */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <p className="section-label" style={{ marginBottom: 0 }}>Revision History — last 30 days</p>
        </div>

        {(recentRevisions ?? []).length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
            No revisions in the last 30 days.{' '}
            <Link href="/home" style={{ color: 'var(--green-800)' }}>Start from the homepage →</Link>
          </div>
        ) : (
          (recentRevisions ?? []).map((rev: any, i: number) => (
            <div
              key={rev.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px',
                borderBottom: i < (recentRevisions ?? []).length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              {/* Status dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: rev.status === 'completed' ? 'var(--green-400)'
                  : rev.status === 'overdue' ? 'var(--rose-400)'
                  : rev.status === 'snoozed' ? 'var(--amber-400)'
                  : 'var(--border-strong)',
              }} />

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                  {rev.topic?.name ?? 'Unknown topic'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {rev.topic?.section?.name} · Revision #{rev.revision_number}
                </p>
              </div>

              <div style={{ textAlign: 'right', fontSize: 12 }}>
                <p style={{
                  color: rev.status === 'completed' ? 'var(--green-800)'
                    : rev.status === 'overdue' ? 'var(--rose-800)'
                    : 'var(--text-3)',
                  fontWeight: 500, marginBottom: 2, textTransform: 'capitalize',
                }}>
                  {rev.status}
                </p>
                <p style={{ color: 'var(--text-3)' }}>
                  {format(new Date(rev.created_at), 'MMM d')}
                  {rev.mcq_score != null && ` · MCQ: ${Math.round(rev.mcq_score)}%`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
