import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getActiveSyllabus, getSectionsWithProgress } from '@/lib/supabase/queries/topics'
import Link from 'next/link'
import type { SectionWithTopics } from '@/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Syllabus' }

function SectionHealthBar({ section }: { section: SectionWithTopics }) {
  const total = section.topics.length
  const studied    = section.topics.filter(t => t.progress && t.progress.level >= 1).length
  const completed  = section.topics.filter(t => t.progress && t.progress.level >= 2).length
  const mastered   = section.topics.filter(t => t.progress && t.progress.level >= 4).length

  const studiedPct  = total > 0 ? (studied / total) * 100 : 0
  const completedPct= total > 0 ? (completed / total) * 100 : 0
  const masteredPct = total > 0 ? (mastered / total) * 100 : 0

  // Average retention for studied topics
  const studiedTopics = section.topics.filter(t => t.progress && t.progress.level >= 1)
  const avgRetention = studiedTopics.length > 0
    ? Math.round(studiedTopics.reduce((sum, t) => sum + (t.progress?.retention_score ?? 0), 0) / studiedTopics.length)
    : 0

  const overdueInSection = section.topics.filter(t => t.progress?.is_overdue).length

  return (
    <div>
      {/* Stacked progress bar */}
      <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ width: `${masteredPct}%`, background: 'var(--green-800)', transition: 'width 0.6s ease' }} />
          <div style={{ width: `${completedPct - masteredPct}%`, background: 'var(--green-400)', transition: 'width 0.6s ease' }} />
          <div style={{ width: `${studiedPct - completedPct}%`, background: '#B0E8CA', transition: 'width 0.6s ease' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-3)' }}>
        <span>{studied}/{total} studied</span>
        {mastered > 0 && <span style={{ color: 'var(--green-800)' }}>· {mastered} mastered</span>}
        {avgRetention > 0 && <span>· {avgRetention}% retention</span>}
        {overdueInSection > 0 && (
          <span style={{ color: 'var(--rose-800)' }}>· {overdueInSection} overdue</span>
        )}
      </div>
    </div>
  )
}

export default async function SyllabusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const syllabus = await getActiveSyllabus(user.id)

  if (!syllabus) {
    return (
      <div style={{ padding: '40px 32px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', padding: '48px 40px',
          textAlign: 'center', boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>📚</div>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 24, fontWeight: 400, marginBottom: 12 }}>
            No syllabus found
          </h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>
            Complete your onboarding to set up your syllabus.
          </p>
          <Link href="/onboarding" className="btn btn-primary">
            Set up syllabus
          </Link>
        </div>
      </div>
    )
  }

  const sections = await getSectionsWithProgress(user.id, syllabus.id)

  const totalTopics = sections.reduce((s, sec) => s + sec.topics.length, 0)
  const studiedTopics = sections.reduce((s, sec) => s + sec.topics.filter(t => t.progress && t.progress.level >= 1).length, 0)

  return (
    <div style={{ padding: '40px 32px 64px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }} className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(24px, 3.5vw, 32px)',
              fontWeight: 400, marginBottom: 6,
            }}>
              {syllabus.name}
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
              {syllabus.branch} · {sections.length} sections · {totalTopics} topics
            </p>
          </div>

          {/* Overall progress */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 400, color: 'var(--green-800)' }}>
              {totalTopics > 0 ? Math.round((studiedTopics / totalTopics) * 100) : 0}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>studied</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ marginTop: 16, height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${totalTopics > 0 ? (studiedTopics / totalTopics) * 100 : 0}%`,
            background: 'linear-gradient(90deg, var(--green-600), var(--green-400))',
            borderRadius: 99,
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {/* Sections grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="stagger">
        {sections.map(section => (
          <Link
            key={section.id}
            href={`/syllabus/${section.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '20px 22px',
                boxShadow: 'var(--shadow-card)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              className="animate-slide-up card-hover"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h3 style={{
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 18, fontWeight: 400,
                    color: 'var(--text)', marginBottom: 4,
                  }}>
                    {section.name}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    {section.topics.length} topics
                  </p>
                </div>

                {/* Topic level pills */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200, justifyContent: 'flex-end' }}>
                  {section.topics.slice(0, 6).map(topic => (
                    <div
                      key={topic.id}
                      title={`${topic.name}: ${topic.progress?.knowledge_health ?? 'Not started'}`}
                      style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: !topic.progress || topic.progress.level === 0 ? 'var(--surface-2)'
                          : topic.progress.level === 4 ? 'var(--green-800)'
                          : topic.progress.level >= 2 ? 'var(--green-400)'
                          : 'var(--amber-400)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  ))}
                  {section.topics.length > 6 && (
                    <span style={{ fontSize: 10, color: 'var(--text-3)', alignSelf: 'center' }}>
                      +{section.topics.length - 6}
                    </span>
                  )}
                </div>
              </div>

              <SectionHealthBar section={section} />
            </div>
          </Link>
        ))}
      </div>

      {/* Add custom section */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--text-3)', fontSize: 13 }}
        >
          + Add custom section
        </button>
      </div>
    </div>
  )
}
