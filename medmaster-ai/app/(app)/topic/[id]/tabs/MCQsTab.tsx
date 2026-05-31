// MCQsTab — Phase 2 will populate with AI-generated questions

'use client'

import Link from 'next/link'

interface MCQsTabProps {
  topicId: string
  userId: string
  level: number
}

export default function MCQsTab({ topicId, level }: MCQsTabProps) {
  if (level === 0) {
    return (
      <EmptyState
        icon="❓"
        title="Study first"
        body="Mark this topic as studied to unlock MCQ practice."
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '32px 28px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'var(--amber-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>🤖</div>
          <div>
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 19, fontWeight: 400, marginBottom: 8 }}>
              AI MCQ Generation
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>
              Upload your notes and use the AI processor to generate topic-specific MCQs. Available in Phase 2.
            </p>
            <Link href={`/topic/${topicId}?tab=notes`} className="btn btn-secondary btn-sm">
              📄 Upload notes first
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── DiscussionTab ─────────────────────────────────────────────

interface DiscussionTabProps {
  topicId: string
  userId: string
}

export function DiscussionTab({ topicId, userId }: DiscussionTabProps) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: '32px 28px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--r-md)',
          background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>💬</div>
        <div>
          <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 19, fontWeight: 400, marginBottom: 8 }}>
            Topic Discussion
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
            Discussion threads for this topic will appear here. Ask clinical questions, share insights, or clarify doubts with your peers. Coming in Phase 4.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── ProgressTab ───────────────────────────────────────────────

import type { UserTopicProgress } from '@/types/database'
import { format } from 'date-fns'
import { LEVEL_LABELS } from '@/lib/revision/schedule'

interface ProgressTabProps {
  topicId: string
  userId: string
  progress: UserTopicProgress | null
}

export function ProgressTab({ topicId, userId, progress }: ProgressTabProps) {
  if (!progress || progress.level === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No progress yet"
        body="Study this topic to begin tracking your progress and retention."
      />
    )
  }

  const intervals = [
    { day: 7, label: 'Day 7', done: progress.revision_count >= 1 },
    { day: 14, label: 'Day 14', done: progress.revision_count >= 2 },
    { day: 21, label: 'Day 21', done: progress.revision_count >= 3 },
    { day: 45, label: 'Day 45', done: progress.revision_count >= 4 },
    { day: 90, label: 'Day 90', done: progress.revision_count >= 5 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1,
        background: 'var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)',
      }}>
        {[
          { label: 'Level',     value: LEVEL_LABELS[progress.level], highlight: progress.level === 4 },
          { label: 'Retention', value: `${Math.round(progress.retention_score)}%` },
          { label: 'Revisions', value: `${progress.revision_count} / 5` },
          { label: 'MCQ Avg',   value: progress.mcq_avg_score > 0 ? `${Math.round(progress.mcq_avg_score)}%` : '—' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.highlight ? 'var(--green-50)' : 'var(--surface)',
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 400,
              color: stat.highlight ? 'var(--green-800)' : 'var(--text)',
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Revision schedule */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '20px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <p className="section-label" style={{ marginBottom: 16 }}>Revision schedule</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {intervals.map((interval, i) => (
            <div
              key={interval.day}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
                borderBottom: i < intervals.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: interval.done ? 'var(--green-100)' : i === progress.revision_count ? 'var(--amber-100)' : 'var(--surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, flexShrink: 0,
                color: interval.done ? 'var(--green-800)' : i === progress.revision_count ? 'var(--amber-800)' : 'var(--text-3)',
              }}>
                {interval.done ? '✓' : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: i === progress.revision_count ? 500 : 400, color: 'var(--text)' }}>
                  {interval.label}
                </span>
                {i === progress.revision_count && progress.next_revision_at && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--amber-800)' }}>
                    Due {format(new Date(progress.next_revision_at), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: interval.done ? 'var(--green-800)' : 'var(--text-3)' }}>
                {interval.done ? 'Completed' : i === progress.revision_count ? 'Upcoming' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key dates */}
      {progress.last_studied_at && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '18px 20px',
          boxShadow: 'var(--shadow-card)', fontSize: 14,
        }}>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <span style={{ color: 'var(--text-3)' }}>First studied: </span>
              <span style={{ fontWeight: 500 }}>{format(new Date(progress.last_studied_at), 'MMM d, yyyy')}</span>
            </div>
            {progress.next_revision_at && (
              <div>
                <span style={{ color: 'var(--text-3)' }}>Next revision: </span>
                <span style={{ fontWeight: 500, color: progress.is_overdue ? 'var(--rose-800)' : 'var(--text)' }}>
                  {format(new Date(progress.next_revision_at), 'MMM d, yyyy')}
                  {progress.is_overdue && ' (Overdue)'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared empty state ────────────────────────────────────────

function EmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 400, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: '32ch', margin: '0 auto' }}>{body}</p>
    </div>
  )
}
