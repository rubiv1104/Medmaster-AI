'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { Resource, UserTopicProgress } from '@/types/database'
import NotesTab from '@/app/(app)/topic/[id]/tabs/NotesTab'
import RevisionNotesTab from '@/app/(app)/topic/[id]/tabs/RevisionNotesTab'
import MCQsTab from '@/app/(app)/topic/[id]/tabs/MCQsTab'
import DiscussionTab from '@/app/(app)/topic/[id]/tabs/DiscussionTab'
import ProgressTab from '@/app/(app)/topic/[id]/tabs/ProgressTab'

interface TopicTabsProps {
  topicId: string
  topicName: string
  userId: string
  activeTab: string
  resources: Resource[]
  progress: UserTopicProgress | null
  pendingRevisionId: string | null
  level: number
}

const TABS = [
  { id: 'notes',          label: 'Notes',          icon: '📄' },
  { id: 'revision-notes', label: 'Revision Notes',  icon: '⚡' },
  { id: 'mcqs',           label: 'MCQs',            icon: '❓' },
  { id: 'discussion',     label: 'Discussion',      icon: '💬' },
  { id: 'progress',       label: 'Progress',        icon: '📊' },
]

export default function TopicTabs({
  topicId, topicName, userId, activeTab, resources, progress, pendingRevisionId, level
}: TopicTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  function setTab(tabId: string) {
    router.push(`${pathname}?tab=${tabId}`, { scroll: false })
  }

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid var(--border)',
        margin: '0 -32px', padding: '0 32px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        position: 'sticky', top: 0, background: 'var(--surface-2)',
        zIndex: 10,
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '14px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--green-800)' : 'var(--text-3)',
                borderBottom: isActive ? '2px solid var(--green-800)' : '2px solid transparent',
                marginBottom: -1, transition: 'all 0.15s ease',
                whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <span style={{ fontSize: 15 }}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div style={{ paddingTop: 28 }}>
        {activeTab === 'notes' && (
          <NotesTab
            topicId={topicId}
            topicName={topicName}
            userId={userId}
            resources={resources}
            level={level}
          />
        )}

        {activeTab === 'revision-notes' && (
          <RevisionNotesTab
            topicId={topicId}
            userId={userId}
            progress={progress}
            pendingRevisionId={pendingRevisionId}
          />
        )}

        {activeTab === 'mcqs' && (
          <MCQsTab
            topicId={topicId}
            userId={userId}
            level={level}
          />
        )}

        {activeTab === 'discussion' && (
          <DiscussionTab
            topicId={topicId}
            userId={userId}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            topicId={topicId}
            userId={userId}
            progress={progress}
          />
        )}
      </div>
    </div>
  )
}
