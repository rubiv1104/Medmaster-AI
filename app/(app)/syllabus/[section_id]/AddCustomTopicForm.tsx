'use client'

import { useState } from 'react'
import { addCustomTopic } from '@/lib/actions/topic'
import { useRouter } from 'next/navigation'

export default function AddCustomTopicForm({ sectionId }: { sectionId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleAdd() {
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    const result = await addCustomTopic({ section_id: sectionId, name: name.trim() })

    if (result?.error) {
      setError(result.error)
    } else {
      setName('')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn btn-ghost btn-sm"
        style={{ color: 'var(--text-3)', fontSize: 13 }}
      >
        + Add custom topic
      </button>
    )
  }

  return (
    <div
      className="animate-slide-up"
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '18px 20px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>
        Add a custom topic
      </p>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          className="input"
          placeholder="e.g. Vataja Kasa — Advanced"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          autoFocus
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={handleAdd}
          disabled={loading || !name.trim()}
        >
          {loading ? '…' : 'Add'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { setOpen(false); setName(''); setError(null) }}
        >
          Cancel
        </button>
      </div>

      {error && <p style={{ marginTop: 8, fontSize: 13, color: 'var(--rose-800)' }}>{error}</p>}
    </div>
  )
}
