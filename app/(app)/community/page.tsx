import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Community' }

const FILE_ICONS: Record<string, string> = {
  pdf: '📄', ppt: '📊', pptx: '📊', docx: '📝', image: '🖼️', other: '📎',
}

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Latest public resources across the platform
  const { data: resources } = await supabase
    .from('resources')
    .select(`
      *,
      uploader:users(full_name, college),
      topic:topics(name, section:sections(name))
    `)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(20)

  // Top saved resources
  const { data: topSaved } = await supabase
    .from('resources')
    .select(`
      *,
      uploader:users(full_name),
      topic:topics(name)
    `)
    .eq('visibility', 'public')
    .order('save_count', { ascending: false })
    .limit(5)

  return (
    <div style={{ padding: '40px 32px 64px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
          Community
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: '54ch' }}>
          Browse notes and resources shared by your peers. Quality over quantity — sorted by what&apos;s actually helpful.
        </p>
      </div>

      {/* Phase 4 features preview */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', padding: '20px 22px',
        marginBottom: 28, boxShadow: 'var(--shadow-card)',
        display: 'flex', gap: 20, flexWrap: 'wrap',
      }}>
        {[
          { icon: '🤝', label: 'Discussions', sub: 'Coming Phase 4', active: false },
          { icon: '🏆', label: 'Leaderboard', sub: 'Coming Phase 4', active: false },
          { icon: '📄', label: 'Resources',   sub: 'Active now',     active: true  },
        ].map(item => (
          <div
            key={item.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 'var(--r-md)',
              background: item.active ? 'var(--green-50)' : 'var(--surface-2)',
              border: `1px solid ${item.active ? 'var(--green-100)' : 'var(--border)'}`,
              opacity: item.active ? 1 : 0.6,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: item.active ? 'var(--green-900)' : 'var(--text)' }}>
                {item.label}
              </div>
              <div style={{ fontSize: 11, color: item.active ? 'var(--green-700)' : 'var(--text-3)' }}>
                {item.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

        {/* Main: Recent resources */}
        <div>
          <p className="section-label" style={{ marginBottom: 14 }}>Recently shared</p>

          {(resources ?? []).length === 0 ? (
            <div style={{
              background: 'var(--surface)', border: '2px dashed var(--border)',
              borderRadius: 'var(--r-xl)', padding: '48px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🌱</div>
              <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, marginBottom: 8 }}>
                No community resources yet
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
                Be the first to share notes with your peers.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(resources ?? []).map((resource: any) => (
                <div
                  key={resource.id}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-lg)', padding: '16px 18px',
                    boxShadow: 'var(--shadow-card)', display: 'flex', gap: 14,
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--r-sm)',
                    background: 'var(--surface-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    {FILE_ICONS[resource.file_type ?? 'other']}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                      {resource.title}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>
                      {resource.topic?.section?.name} · {resource.topic?.name}
                    </p>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-3)' }}>
                      <span>by {resource.uploader?.full_name ?? 'Anonymous'}</span>
                      {resource.uploader?.college && <span>· {resource.uploader.college}</span>}
                      <span>· {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Stats + action */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-3)' }}>
                      {resource.save_count > 0 && <span>🔖 {resource.save_count}</span>}
                      {resource.upvote_count > 0 && <span>👍 {resource.upvote_count}</span>}
                    </div>
                    <a
                      href="#"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 12 }}
                    >
                      Open
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Top saved */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <p className="section-label" style={{ marginBottom: 0 }}>Most saved</p>
            </div>
            {(topSaved ?? []).length === 0 ? (
              <p style={{ padding: '16px', fontSize: 13, color: 'var(--text-3)' }}>No resources yet.</p>
            ) : (
              (topSaved ?? []).map((r: any, i: number) => (
                <div
                  key={r.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: i < (topSaved ?? []).length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', gap: 10, alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{FILE_ICONS[r.file_type ?? 'other']}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 500, color: 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {r.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.topic?.name}</p>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>
                    🔖 {r.save_count}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Contribute nudge */}
          <div style={{
            background: 'var(--green-50)', border: '1px solid var(--green-100)',
            borderRadius: 'var(--r-lg)', padding: '18px 16px',
          }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--green-900)', marginBottom: 6 }}>
              🌿 Share your notes
            </p>
            <p style={{ fontSize: 13, color: 'var(--green-800)', lineHeight: 1.6, marginBottom: 14, opacity: 0.85 }}>
              Help your peers by uploading public notes to any topic.
            </p>
            <a href="/syllabus" className="btn btn-primary btn-sm">
              Go to syllabus
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          div[style*="grid-template-columns: 1fr 280px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
