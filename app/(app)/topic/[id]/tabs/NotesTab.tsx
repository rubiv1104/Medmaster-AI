'use client'

import { useState } from 'react'
import type { Resource } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import FileUpload from '@/components/upload/FileUpload'
import { FileText, FilePlus2, ExternalLink, Bookmark, ThumbsUp } from 'lucide-react'

interface NotesTabProps {
  topicId: string
  topicName: string
  userId: string
  resources: Resource[]
  level: number
}

const FILE_ICONS: Record<string, string> = {
  pdf:  '📄',
  ppt:  '📊',
  pptx: '📊',
  docx: '📝',
  image:'🖼️',
  other:'📎',
}

function ResourceCard({ resource, isOwn }: { resource: Resource; isOwn: boolean }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      padding: '14px 16px',
      display: 'flex', gap: 14, alignItems: 'flex-start',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.15s ease',
    }}>
      {/* File type icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--r-sm)',
        background: 'var(--surface-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        {FILE_ICONS[resource.file_type ?? 'other']}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)', marginBottom: 3, lineHeight: 1.3 }}>
          {resource.title}
        </p>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-3)', alignItems: 'center' }}>
          <span style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.04em' }}>
            {resource.file_type}
          </span>
          {resource.file_size_bytes && (
            <span>{(resource.file_size_bytes / 1024 / 1024).toFixed(1)} MB</span>
          )}
          <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
          {resource.visibility === 'private' && (
            <span style={{ color: 'var(--amber-800)', background: 'var(--amber-100)', padding: '1px 6px', borderRadius: 99 }}>
              Private
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
        <button
          className="btn btn-ghost btn-sm"
          title="Save"
          style={{ padding: '6px 8px', color: 'var(--text-3)' }}
        >
          <Bookmark size={15} />
          {resource.save_count > 0 && (
            <span style={{ fontSize: 11, marginLeft: 2 }}>{resource.save_count}</span>
          )}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          title="Upvote"
          style={{ padding: '6px 8px', color: 'var(--text-3)' }}
        >
          <ThumbsUp size={15} />
          {resource.upvote_count > 0 && (
            <span style={{ fontSize: 11, marginLeft: 2 }}>{resource.upvote_count}</span>
          )}
        </button>
        <a
          href="#" // Will be a Supabase signed URL in production
          className="btn btn-secondary btn-sm"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <ExternalLink size={13} />
          Open
        </a>
      </div>
    </div>
  )
}

export default function NotesTab({ topicId, topicName, userId, resources, level }: NotesTabProps) {
  const [showUpload, setShowUpload] = useState(false)

  const myResources = resources.filter(r => r.uploaded_by === userId)
  const communityResources = resources.filter(r => r.uploaded_by !== userId && r.visibility === 'public')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Upload trigger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 400, marginBottom: 4 }}>
            Study Materials
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {resources.length === 0 ? 'No notes uploaded yet.' : `${resources.length} file${resources.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowUpload(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FilePlus2 size={14} />
          Upload notes
        </button>
      </div>

      {/* Upload area */}
      {showUpload && (
        <div className="animate-slide-up">
          <FileUpload
            topicId={topicId}
            userId={userId}
            onSuccess={() => {
              setShowUpload(false)
              window.location.reload()
            }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* My notes */}
      {myResources.length > 0 && (
        <div>
          <p className="section-label" style={{ marginBottom: 12 }}>Your notes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myResources.map(r => <ResourceCard key={r.id} resource={r} isOwn />)}
          </div>
        </div>
      )}

      {/* Community notes */}
      {communityResources.length > 0 && (
        <div>
          <p className="section-label" style={{ marginBottom: 12 }}>Community notes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {communityResources.map(r => <ResourceCard key={r.id} resource={r} isOwn={false} />)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {resources.length === 0 && !showUpload && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: 'var(--surface)', border: '2px dashed var(--border)',
          borderRadius: 'var(--r-xl)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📄</div>
          <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 400, marginBottom: 8 }}>
            No notes yet for {topicName}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20, maxWidth: '32ch', margin: '0 auto 20px' }}>
            Upload your PDF, PPT, or DOCX notes. AI can generate revision notes and MCQs from them.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowUpload(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <FilePlus2 size={16} />
            Upload your first notes
          </button>
        </div>
      )}
    </div>
  )
}
