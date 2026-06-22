'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, isPast } from 'date-fns'
import { snoozeRevision } from '@/lib/actions/revision'
import type { RevisionDue } from '@/types/database'
import { LEVEL_LABELS } from '@/lib/revision/schedule'

interface TodayRevisionsProps {
  revisionsDue: RevisionDue[]
}

const HEALTH_CONFIG = {
  excellent:    { label: 'Excellent',     className: 'health-excellent',   dot: '#52B788' },
  good:         { label: 'Good',          className: 'health-good',        dot: '#3A9E73' },
  needs_revision:{ label: 'Needs Revision', className: 'health-needs',    dot: '#E9C46A' },
  at_risk:      { label: 'At Risk',       className: 'health-at-risk',     dot: '#E76F51' },
  not_started:  { label: 'Not Started',   className: 'health-not-started', dot: '#9C9A94' },
}

export default function TodayRevisions({ revisionsDue }: TodayRevisionsProps) {
  if (revisionsDue.length === 0) {
    return (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '32px 24px',
        textAlign: 'center', boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🌿</div>
        <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17, color: 'var(--text)', marginBottom: 6 }}>
          All caught up
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: '30ch', margin: '0 auto' }}>
          No revisions due today. Study a new topic to build your schedule.
        </p>
        <Link
          href="/syllabus"
          className="btn btn-secondary btn-sm"
          style={{ marginTop: 18, display: 'inline-flex' }}
        >
          Browse syllabus
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="stagger">
      {revisionsDue.map(item => (
        <RevisionCard key={item.topic.id} item={item} />
      ))}
    </div>
  )
}

function RevisionCard({ item }: { item: RevisionDue }) {
  const [snoozed, setSnoozed] = useState(false)
  const [showSnooze, setShowSnooze] = useState(false)
  const [loading, setLoading] = useState(false)

  const { topic, progress, revision, section_name } = item
  const health = HEALTH_CONFIG[progress.knowledge_health] ?? HEALTH_CONFIG.not_started
  const isOverdue = progress.is_overdue || (progress.next_revision_at ? isPast(new Date(progress.next_revision_at)) : false)

  async function handleSnooze(days: 1 | 2 | 3 | 7) {
    if (!revision) return
    setLoading(true)
    await snoozeRevision({
      topicId: topic.id,
      revisionLogId: revision.id,
      days,
    })
    setSnoozed(true)
    setLoading(false)
    setShowSnooze(false)
  }

  if (snoozed) return null

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: `1px solid ${isOverdue ? 'rgba(231,111,81,0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-card)',
        transition: 'box-shadow 0.2s ease',
        borderLeft: `3px solid ${health.dot}`,
      }}
      className="animate-slide-up"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{section_name}</span>
            <span style={{ color: 'var(--border-strong)', fontSize: 12 }}>·</span>
            <span className={`badge ${health.className}`} style={{ fontSize: 11 }}>
              {health.label}
            </span>
            {isOverdue && (
              <span className="badge" style={{ background: 'var(--rose-100)', color: 'var(--rose-800)', fontSize: 11 }}>
                Overdue
              </span>
            )}
          </div>

          <h3 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 17, fontWeight: 400,
            color: 'var(--text)', marginBottom: 6, lineHeight: 1.3,
          }}>
            {topic.name}
          </h3>

          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-3)' }}>
            <span>
              Revision #{progress.revision_count + 1}
            </span>
            <span>
              Retention: {Math.round(progress.retention_score)}%
            </span>
            {progress.next_revision_at && (
              <span>
                Due {formatDistanceToNow(new Date(progress.next_revision_at), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {/* Snooze */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowSnooze(v => !v)}
              disabled={loading || progress.snooze_count >= 3}
              title={progress.snooze_count >= 3 ? 'Max snoozes reached' : 'Snooze revision'}
              style={{ padding: '7px 10px', fontSize: 16 }}
            >
              💤
            </button>

            {showSnooze && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 6,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)',
                zIndex: 20, minWidth: 140, overflow: 'hidden',
              }}>
                <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-3)', borderBottom: '1px solid var(--border)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Snooze for…
                </div>
                {([1, 2, 3, 7] as const).map(days => (
                  <button
                    key={days}
                    onClick={() => handleSnooze(days)}
                    style={{
                      display: 'block', width: '100%', padding: '9px 14px',
                      textAlign: 'left', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: 13, color: 'var(--text)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {days === 1 ? 'Tomorrow' : days === 7 ? '1 week (max)' : `${days} days`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Revise button */}
          <Link
            href={`/topic/${topic.id}?tab=revision-notes`}
            className="btn btn-primary btn-sm"
          >
            Revise
          </Link>
        </div>
      </div>

      {/* Retention bar */}
      <div style={{ marginTop: 12 }}>
        <div style={{
          height: 3, background: 'var(--surface-2)', borderRadius: 99,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress.retention_score}%`,
            background: progress.retention_score >= 80 ? 'var(--green-400)'
              : progress.retention_score >= 60 ? '#74D0A0'
              : progress.retention_score >= 40 ? 'var(--amber-400)'
              : 'var(--rose-400)',
            borderRadius: 99,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>
    </div>
  )
}
