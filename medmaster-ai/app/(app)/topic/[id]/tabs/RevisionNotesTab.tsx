'use client'

import Link from 'next/link'
import type { UserTopicProgress } from '@/types/database'
import { completeRevision } from '@/lib/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface RevisionNotesTabProps {
  topicId: string
  userId: string
  progress: UserTopicProgress | null
  pendingRevisionId: string | null
}

export default function RevisionNotesTab({
  topicId, userId, progress, pendingRevisionId
}: RevisionNotesTabProps) {
  const [completing, setCompleting] = useState(false)
  const router = useRouter()

  const isRevisionDue = progress && progress.next_revision_at
    ? new Date(progress.next_revision_at) <= new Date(Date.now() + 86400000)
    : false

  async function handleCompleteRevision() {
    if (!pendingRevisionId) return
    setCompleting(true)
    await completeRevision({
      topicId,
      revisionLogId: pendingRevisionId,
    })
    setCompleting(false)
    router.refresh()
  }

  // No progress yet
  if (!progress || progress.level === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '48px 24px',
        background: 'var(--surface)', border: '2px dashed var(--border)',
        borderRadius: 'var(--r-xl)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>⚡</div>
        <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 400, marginBottom: 8 }}>
          Study this topic first
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: '32ch', margin: '0 auto' }}>
          Mark the topic as studied to activate your revision schedule. Revision notes will appear here.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Revision due banner */}
      {isRevisionDue && pendingRevisionId && (
        <div style={{
          background: 'var(--green-50)', border: '1px solid var(--green-100)',
          borderRadius: 'var(--r-lg)', padding: '18px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--green-900)', marginBottom: 3 }}>
              🔄 Revision #{progress.revision_count + 1} is due
            </p>
            <p style={{ fontSize: 13, color: 'var(--green-800)', opacity: 0.8 }}>
              Review your notes, then mark this revision complete.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCompleteRevision}
            disabled={completing}
            style={{ flexShrink: 0 }}
          >
            {completing ? 'Saving…' : '✓ Mark complete'}
          </button>
        </div>
      )}

      {/* Phase 2 coming soon — AI content placeholder */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '32px 28px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>
            🤖
          </div>
          <div>
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 19, fontWeight: 400, marginBottom: 8 }}>
              AI Revision Notes
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>
              Upload your notes in the <strong>Notes</strong> tab, then use the AI processor to generate concise revision notes for this topic. This feature is being activated in Phase 2.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                href={`/topic/${topicId}?tab=notes`}
                className="btn btn-secondary btn-sm"
              >
                📄 Go to Notes tab
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Revision history summary */}
      {progress.revision_count > 0 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '20px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Your revision journey</p>

          {/* Revision interval dots */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {[7, 14, 21, 45, 90].map((day, i) => {
              const done = i < progress.revision_count
              const current = i === progress.revision_count
              return (
                <div key={day} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    height: 4, borderRadius: 2,
                    background: done ? 'var(--green-400)' : current ? 'var(--amber-400)' : 'var(--surface-2)',
                    marginBottom: 6, transition: 'background 0.3s ease',
                  }} />
                  <div style={{ fontSize: 11, color: done ? 'var(--green-800)' : current ? 'var(--amber-800)' : 'var(--text-3)' }}>
                    Day {day}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                    {done ? '✓' : current ? 'next' : '·'}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <div>
              <span style={{ color: 'var(--text-3)' }}>Completed </span>
              <span style={{ fontWeight: 600 }}>{progress.revision_count} of 5</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-3)' }}>Retention </span>
              <span style={{ fontWeight: 600 }}>{Math.round(progress.retention_score)}%</span>
            </div>
            {progress.next_revision_at && (
              <div>
                <span style={{ color: 'var(--text-3)' }}>Next </span>
                <span style={{ fontWeight: 600 }}>{format(new Date(progress.next_revision_at), 'MMM d')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
