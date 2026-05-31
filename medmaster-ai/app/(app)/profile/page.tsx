import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('*, achievement:achievements(*)')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false })

  const { count: topicsStudied } = await supabase
    .from('user_topic_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('level', 1)

  const { count: topicsMastered } = await supabase
    .from('user_topic_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('level', 4)

  if (!profile) redirect('/onboarding')

  const initials = profile.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'S'

  return (
    <div style={{ padding: '40px 32px 64px', maxWidth: 700, margin: '0 auto' }}>

      <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 28 }}>
        Profile
      </h1>

      {/* Profile card */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', padding: '28px',
        boxShadow: 'var(--shadow-card)', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Avatar */}
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name ?? ''} style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--green-800), var(--green-600))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 26, fontFamily: 'Fraunces, Georgia, serif',
              flexShrink: 0,
            }}>
              {initials}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 400, marginBottom: 4 }}>
              {profile.full_name ?? 'Student'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 2 }}>{profile.branch}</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{profile.college} · Batch {profile.batch_year}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
          background: 'var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden',
          marginTop: 24,
        }}>
          {[
            { label: 'XP',        value: profile.xp_total ?? 0 },
            { label: 'Studied',   value: topicsStudied ?? 0 },
            { label: 'Mastered',  value: topicsMastered ?? 0 },
            { label: 'RCS',       value: `${Math.round(profile.rcs_score ?? 0)}%` },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--surface)', padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 400, color: 'var(--green-800)' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {(achievements ?? []).length > 0 && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', padding: '24px',
          boxShadow: 'var(--shadow-card)', marginBottom: 20,
        }}>
          <p className="section-label" style={{ marginBottom: 16 }}>Achievements</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {(achievements ?? []).map((ua: any) => (
              <div
                key={ua.id}
                title={ua.achievement?.description ?? ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 12px', borderRadius: 99,
                  background: 'var(--green-50)', border: '1px solid var(--green-100)',
                  fontSize: 13, color: 'var(--green-900)',
                }}
              >
                <span>{ua.achievement?.icon}</span>
                <span style={{ fontWeight: 500 }}>{ua.achievement?.name}</span>
                <span style={{ fontSize: 11, color: 'var(--green-600)' }}>+{ua.achievement?.xp_reward} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings / actions */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)', overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}>
        {[
          { label: 'Edit profile', href: '/profile/settings', icon: '✏️' },
          { label: 'Notification settings', href: '/profile/notifications', icon: '🔔' },
        ].map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '15px 20px',
              borderBottom: i < 1 ? '1px solid var(--border)' : 'none',
              textDecoration: 'none', color: 'var(--text)',
              fontSize: 14, transition: 'background 0.15s',
            }}
            className="profile-row"
          >
            <span>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            <span style={{ color: 'var(--text-3)' }}>→</span>
          </a>
        ))}

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '15px 20px', background: 'none', border: 'none',
              borderTop: '1px solid var(--border)',
              cursor: 'pointer', fontSize: 14, color: 'var(--rose-800)',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'background 0.15s',
            }}
            className="profile-row"
          >
            <span>🚪</span>
            <span>Sign out</span>
          </button>
        </form>
      </div>

      <style>{`.profile-row:hover { background: var(--surface-2) !important; }`}</style>
    </div>
  )
}
