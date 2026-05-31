'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markTopicStudied } from '@/lib/actions/topic'

type Props = {
  topicId: string
}

export default function MarkStudiedButton({ topicId }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const router = useRouter()

  async function handleClick() {
    setLoading(true)

    const result = await markTopicStudied(topicId)

    if (result?.error) {
      console.error(result.error)
    } else {
      setDone(true)

      setTimeout(() => {
        router.refresh()
      }, 800)
    }

    setLoading(false)
  }

  if (done) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          borderRadius: 'var(--r-md)',
          background: 'var(--green-100)',
          color: 'var(--green-900)',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        ✓ Marked as Studied
      </div>
    )
  }

  return (
    <button
      type="button"
      className="btn btn-primary"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <>
          <Spinner />
          Saving…
        </>
      ) : (
        <>✓ Mark as Studied</>
      )}
    </button>
  )
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}