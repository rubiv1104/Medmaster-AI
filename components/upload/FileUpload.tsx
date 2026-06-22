'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createResourceRecord } from '@/lib/actions/resources'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  topicId: string
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error'

const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/msword': 'docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
}

const MAX_SIZE_MB = 50

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function FileUpload({ topicId, userId, onSuccess, onCancel }: FileUploadProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED_TYPES[f.type]) {
      setError('File type not supported. Please upload PDF, PPT, DOCX, or an image.')
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`)
      return
    }
    setError(null)
    setFile(f)
    // Auto-fill title from filename
    const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '')
    setTitle(nameWithoutExt)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('idle')
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  async function handleUpload() {
    if (!file || !title.trim()) return

    setState('uploading')
    setError(null)
    setProgress(0)

    try {
      const supabase = createClient()

      // Build storage path: userId/topicId/timestamp-filename
      const ext = file.name.split('.').pop()
      const storagePath = `${userId}/${topicId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`

      // Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('resources')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (storageError) throw new Error(storageError.message)

      setProgress(70)

      // Create DB record
      const fileType = ACCEPTED_TYPES[file.type] ?? 'other'
      const result = await createResourceRecord({
        topicId,
        title: title.trim(),
        fileType,
        storagePath,
        fileSizeBytes: file.size,
        visibility,
      })

      if (result?.error) throw new Error(result.error)

      setProgress(100)
      setState('success')
      setTimeout(onSuccess, 1000)

    } catch (err: any) {
      setState('error')
      setError(err.message ?? 'Upload failed. Please try again.')
    }
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)', padding: '24px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 400 }}>
          Upload study notes
        </h3>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onCancel}
          style={{ padding: '6px 8px' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Drop zone */}
      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setState('dragging') }}
          onDragLeave={() => setState('idle')}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${state === 'dragging' ? 'var(--green-600)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--r-lg)',
            padding: '36px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: state === 'dragging' ? 'var(--green-50)' : 'var(--surface-2)',
            transition: 'all 0.15s ease',
            marginBottom: 16,
          }}
        >
          <Upload size={28} style={{ color: 'var(--text-3)', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 500, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>
            Drag and drop or click to browse
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
            PDF, PPT, PPTX, DOCX, or image · Max {MAX_SIZE_MB}MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,.docx,.jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {/* Selected file */}
      {file && state !== 'success' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
          background: 'var(--surface-2)', borderRadius: 'var(--r-md)', marginBottom: 16,
        }}>
          <span style={{ fontSize: 22 }}>
            {ACCEPTED_TYPES[file.type]?.includes('pdf') ? '📄' : ACCEPTED_TYPES[file.type]?.includes('image') ? '🖼️' : '📊'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{formatBytes(file.size)}</p>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setFile(null); setTitle(''); setProgress(0) }}
            style={{ padding: '4px 6px', color: 'var(--text-3)' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload progress */}
      {state === 'uploading' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--green-400)', borderRadius: 99,
              width: `${progress}%`, transition: 'width 0.3s ease',
            }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
            Uploading… {progress}%
          </p>
        </div>
      )}

      {/* Success */}
      {state === 'success' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px', background: 'var(--green-50)', borderRadius: 'var(--r-md)', marginBottom: 16 }}>
          <CheckCircle size={18} style={{ color: 'var(--green-800)' }} />
          <span style={{ fontSize: 14, color: 'var(--green-900)', fontWeight: 500 }}>Uploaded successfully!</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--rose-100)', borderRadius: 'var(--r-md)', marginBottom: 16 }}>
          <AlertCircle size={16} style={{ color: 'var(--rose-800)' }} />
          <span style={{ fontSize: 13, color: 'var(--rose-800)' }}>{error}</span>
        </div>
      )}

      {/* Form fields — only show when file selected and not uploading */}
      {file && state === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field-group">
            <label className="label">Title</label>
            <input
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Amavata — Complete Notes"
            />
          </div>

          <div className="field-group">
            <label className="label">Visibility</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['public', 'private'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 'var(--r-md)',
                    border: `1.5px solid ${visibility === v ? 'var(--green-800)' : 'var(--border)'}`,
                    background: visibility === v ? 'var(--green-50)' : 'var(--surface)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                    {v === 'public' ? '🌐 Public' : '🔒 Private'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {v === 'public' ? 'Visible to all students' : 'Only you can see this'}
                  </div>
                </button>
              ))}
            </div>
            {visibility === 'public' && (
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
                ℹ This file will be visible to all MD Ayurveda students on the platform.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={handleUpload}
              disabled={!title.trim()}
            >
              Upload & Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
