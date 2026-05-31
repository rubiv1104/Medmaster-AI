'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { RevisionDue } from '@/types/database'

const TIME_OPTIONS = [
  { label: '5 min',  minutes: 5,  icon: '⚡' },
  { label: '10 min', minutes: 10, icon: '🌿' },
  { label: '20 min', minutes: 20, icon: '📖' },
  { label: '30 min', minutes: 30, icon: '🎯' },
  { label: '1 hour', minutes: 60, icon: '🏛️' },
]

interface QuickModeButtonsProps {
  revisionsDue: RevisionDue[]
}

export default function QuickModeButtons({ revisionsDue }: QuickModeButtonsProps) {
  const [selected, setSelected] = useState<number | null>(null)

  function getRecommendations(minutes: number) {
    const topicsPerMinute = 5
    const maxTopics = Math.max(1, Math.floor(minutes / topicsPerMinute))
    const topics = revisionsDue.slice(0, maxTopics)

    const canDoMCQs = minutes >= 5
    const mcqCount = minutes <= 5 ? 3 : minutes <= 10 ? 5 : minutes <= 20 ? 10 : 20

    return { topics, canDoMCQs, mcqCount }
  }

  const selectedOption = TIME_OPTIONS.find(o => o.minutes === selected)
  const recommendations = selected ? getRecommendations(selected) : null

  return (
    <div>
      {/* Time buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: recommendations ? 20 : 0 }}>
        {TIME_OPTIONS.map(option => (
          <button
            key={option.minutes}
            onClick={() => setSelected(prev => prev === option.minutes ? null : option.minutes)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--r-md)',
              border: `1.5px solid ${selected === option.minutes ? 'var(--green-800)' : 'var(--border)'}`,
              background: selected === option.minutes ? 'var(--green-50)' : 'var(--surface)',
              color: selected === option.minutes ? 'var(--green-900)' : 'var(--text)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: selected === option.minutes ? 500 : 400,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: selected === option.minutes ? '0 0 0 3px rgba(45,106,79,0.1)' : 'var(--shadow-sm)',
            }}
          >
            <span>{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {/* Recommendations panel */}
      {selected && recommendations && selectedOption && (
        <div
          className="animate-slide-up"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--green-100)',
            borderRadius: 'var(--r-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-800)', marginBottom: 14, letterSpacing: '0.02em' }}>
            {selectedOption.icon} With {selectedOption.label}, here&apos;s what I recommend:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Topics to revise */}
            {recommendations.topics.length > 0 ? (
              recommendations.topics.map(item => (
                <Link
                  key={item.topic.id}
                  href={`/topic/${item.topic.id}?tab=revision-notes`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--r-md)',
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                  className="quick-rec-item"
                >
                  <span style={{ fontSize: 16 }}>🔄</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                      Revise {item.topic.name}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>
                      ~5 min
                    </span>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--green-800)' }}>→</span>
                </Link>
              ))
            ) : (
              <div style={{
                padding: '10px 14px', background: 'var(--surface-2)',
                borderRadius: 'var(--r-md)', fontSize: 14, color: 'var(--text-2)',
              }}>
                No revisions due. Consider studying a new topic from your{' '}
                <Link href="/syllabus" style={{ color: 'var(--green-800)' }}>syllabus</Link>.
              </div>
            )}

            {/* MCQ suggestion */}
            {recommendations.canDoMCQs && (
              <Link
                href={`/home/quick-mcqs?count=${recommendations.mcqCount}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--r-md)',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                className="quick-rec-item"
              >
                <span style={{ fontSize: 16 }}>❓</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                    Solve {recommendations.mcqCount} MCQs
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>
                    ~{Math.ceil(recommendations.mcqCount / 3)} min
                  </span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--green-800)' }}>→</span>
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        .quick-rec-item:hover {
          background: var(--green-50) !important;
        }
      `}</style>
    </div>
  )
}
