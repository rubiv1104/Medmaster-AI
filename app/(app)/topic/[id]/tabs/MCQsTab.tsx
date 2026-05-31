// MCQsTab — Phase 2 will populate with AI-generated questions

'use client'

import Link from 'next/link'

interface MCQsTabProps {
  topicId: string
  userId: string
  level: number
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
