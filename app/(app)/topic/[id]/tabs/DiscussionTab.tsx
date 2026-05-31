'use client'

interface DiscussionTabProps {
  topicId: string
  userId: string
}

export default function DiscussionTab({ topicId, userId }: DiscussionTabProps) {
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
