'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import FileUpload from '@/components/upload/FileUpload'
import type { SectionWithTopics } from '@/types/database'

interface UploadWorkspaceProps {
  sections: SectionWithTopics[]
  userId: string
}

export default function UploadWorkspace({ sections, userId }: UploadWorkspaceProps) {
  const router = useRouter()
  const topics = useMemo(
    () =>
      sections.flatMap(section =>
        section.topics.map(topic => ({
          id: topic.id,
          name: topic.name,
          sectionName: section.name,
        }))
      ),
    [sections]
  )

  const [topicId, setTopicId] = useState(topics[0]?.id ?? '')
  const selectedTopic = topics.find(topic => topic.id === topicId)

  if (topics.length === 0) {
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        padding: '40px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)',
      }}>
        <h2 style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 24,
          fontWeight: 400,
          marginBottom: 10,
        }}>
          No topics available
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 22 }}>
          Set up your syllabus first, then upload notes, PDFs, images, or slides into a topic.
        </p>
        <button className="btn btn-primary" onClick={() => router.push('/syllabus')}>
          Go to syllabus
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <label className="label" htmlFor="upload-topic">
          Choose topic
        </label>
        <select
          id="upload-topic"
          className="input"
          value={topicId}
          onChange={event => setTopicId(event.target.value)}
        >
          {topics.map(topic => (
            <option key={topic.id} value={topic.id}>
              {topic.sectionName} - {topic.name}
            </option>
          ))}
        </select>
        {selectedTopic && (
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 8 }}>
            Uploading into {selectedTopic.sectionName} / {selectedTopic.name}
          </p>
        )}
      </div>

      <FileUpload
        topicId={topicId}
        userId={userId}
        onSuccess={() => router.refresh()}
        onCancel={() => router.push('/home')}
      />
    </div>
  )
}
