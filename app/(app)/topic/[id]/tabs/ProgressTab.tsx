'use client'

import type { UserTopicProgress } from '@/types/database'
import { format } from 'date-fns'
import { LEVEL_LABELS } from '@/lib/revision/schedule'

interface ProgressTabProps {
  topicId: string
  userId: string
  progress: UserTopicProgress | null
}

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

export default function ProgressTab({ topicId, userId, progress }: ProgressTabProps) {
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
        borderRadius: 'var(--r-lg)', padding: '24px', boxShadow: 'var(--shadow-card)',
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Revision Schedule
        </h3>
        <div style={{ display: 'flex', gap: 10 }}>
          {intervals.map((interval, i) => (
            <div
              key={interval.day}
              style={{
                flex: 1, padding: '12px', textAlign: 'center', borderRadius: 'var(--r-md)',
                background: interval.done ? 'var(--green-50)' : 'var(--surface-2)',
                border: `1px solid ${interval.done ? 'var(--green-200)' : 'var(--border)'}`,
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>
                {interval.done ? '✓' : (i + 1)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {interval.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study dates */}
      {progress.last_studied_at && (
        <div style={{
          background: 'var(--surface-2)', borderRadius: 'var(--r-lg)',
          padding: '16px', fontSize: 13, color: 'var(--text-2)',
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
