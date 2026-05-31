import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRevisionsDueToday, getUserStats } from '@/lib/supabase/queries/topics'
import { getActiveSyllabus } from '@/lib/supabase/queries/topics'
import TodayRevisions from '@/components/home/TodayRevisions'
import QuickModeButtons from '@/components/home/QuickModeButtons'
import AcademicSnapshot from '@/components/home/AcademicSnapshot'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Home' }

function getGreeting(name: string): string {
  const hour = new Date().getHours()
  const first = name.split(' ')[0]
  if (hour < 12) return `Good morning, ${first}.`
  if (hour < 17) return `Good afternoon, ${first}.`
  return `Good evening, ${first}.`
}

function getMotivationalSubtitle(rcsScore: number, studiedCount: number): string {
  if (studiedCount === 0) return "Let's begin. Study your first topic to start your revision journey."
  if (rcsScore >= 90) return "Outstanding consistency. Keep the momentum going."
  if (rcsScore >= 75) return "You're doing well. Stay consistent and the knowledge compounds."
  if (rcsScore >= 50) return "Good progress. A few revisions today will make a real difference."
  return "Every revision you complete today strengthens your foundation."
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    revisionsDue,
    userStats,
    syllabus,
  ] = await Promise.all([
    getRevisionsDueToday(user.id),
    getUserStats(user.id),
    getActiveSyllabus(user.id),
  ])

  const greeting = getGreeting(userStats.user?.full_name ?? 'Student')
  const subtitle = getMotivationalSubtitle(
    userStats.user?.rcs_score ?? 0,
    userStats.studiedTopics
  )

  // Recent activity: count revisions completed this week
  const { count: revisionsThisWeek } = await supabase
    .from('revision_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('completed_at', new Date(Date.now() - 7 * 86400000).toISOString())

  return (
    <div style={{ padding: '40px 32px 64px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Greeting ─────────────────────────────────────────── */}
      <section style={{ marginBottom: 40 }} className="animate-fade-in">
        <h1 style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 400,
          color: 'var(--text)',
          marginBottom: 8,
          lineHeight: 1.2,
        }}>
          {greeting}
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 16, maxWidth: '52ch', lineHeight: 1.6 }}>
          {subtitle}
        </p>

        {/* Week summary — gentle, not guilt-inducing */}
        {(revisionsThisWeek ?? 0) > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginTop: 16, padding: '7px 14px',
            background: 'var(--green-50)', border: '1px solid var(--green-100)',
            borderRadius: 99, fontSize: 13, color: 'var(--green-800)',
          }}>
            <span>🔄</span>
            <span>
              You revised <strong>{revisionsThisWeek}</strong> {revisionsThisWeek === 1 ? 'topic' : 'topics'} this week.
            </span>
          </div>
        )}
      </section>

      {/* ── Main grid ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Section 1: Quick Time Mode */}
          <section className="animate-slide-up">
            <p className="section-label">What would you like to do today?</p>
            <QuickModeButtons revisionsDue={revisionsDue} />
          </section>

          {/* Section 3: Today's Revisions */}
          <section className="animate-slide-up" style={{ animationDelay: '60ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <p className="section-label" style={{ marginBottom: 0 }}>
                Today&apos;s revisions
                {revisionsDue.length > 0 && (
                  <span style={{
                    marginLeft: 8, background: 'var(--green-100)', color: 'var(--green-800)',
                    padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                  }}>
                    {revisionsDue.length}
                  </span>
                )}
              </p>
              {syllabus && (
                <a href="/syllabus" style={{ fontSize: 13, color: 'var(--green-800)' }}>
                  View all topics →
                </a>
              )}
            </div>

            <TodayRevisions revisionsDue={revisionsDue} />
          </section>

        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Section 4: Academic Snapshot */}
          <section className="animate-slide-up" style={{ animationDelay: '120ms' }}>
            <p className="section-label">Academic snapshot</p>
            <AcademicSnapshot
              rcsScore={userStats.user?.rcs_score ?? 0}
              totalTopics={userStats.totalTopics}
              studiedTopics={userStats.studiedTopics}
              masteredTopics={userStats.masteredTopics}
              overdueCount={userStats.overdueCount}
              branch={userStats.user?.branch ?? ''}
            />
          </section>

          {/* Section 5: Quick Recall Zone */}
          <section className="animate-slide-up" style={{ animationDelay: '180ms' }}>
            <p className="section-label">Quick recall zone</p>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)', overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
            }}>
              {[
                { label: 'Quick Revision', icon: '⚡', href: '/home/quick-revision', desc: 'Rapid-fire revision notes' },
                { label: 'Quick MCQs', icon: '❓', href: '/home/quick-mcqs', desc: 'Random MCQ set' },
                { label: 'Recall Challenge', icon: '🎯', href: '/home/recall', desc: 'Test your memory' },
              ].map((item, i, arr) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                    textDecoration: 'none',
                    transition: 'background 0.15s ease',
                    background: 'transparent',
                  }}
                  className="recall-row"
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: 14 }}>→</span>
                </a>
              ))}
            </div>
          </section>

          {/* No syllabus nudge */}
          {!syllabus && (
            <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div style={{
                background: 'var(--amber-100)', border: '1px solid rgba(233,196,106,0.4)',
                borderRadius: 'var(--r-lg)', padding: '18px 20px',
              }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--amber-800)', marginBottom: 6 }}>
                  🌱 No syllabus yet
                </p>
                <p style={{ fontSize: 13, color: 'var(--amber-800)', marginBottom: 14, lineHeight: 1.6, opacity: 0.8 }}>
                  Your syllabus wasn&apos;t set up. Complete onboarding to get started.
                </p>
                <a href="/onboarding" className="btn btn-primary btn-sm">
                  Set up syllabus
                </a>
              </div>
            </section>
          )}
        </div>
      </div>

      <style>{`
        .recall-row:hover { background: var(--surface-2) !important; }
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
