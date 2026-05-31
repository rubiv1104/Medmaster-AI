'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions'
import {
  Home, BookOpen, BarChart2, Users, User, LogOut, Leaf
} from 'lucide-react'

interface SidebarProps {
  userName: string
  avatarUrl: string | null
  rcsScore: number
  branch: string
}

const NAV_ITEMS = [
  { href: '/home',      icon: Home,      label: 'Home' },
  { href: '/syllabus',  icon: BookOpen,  label: 'Syllabus' },
  { href: '/progress',  icon: BarChart2, label: 'Progress' },
  { href: '/community', icon: Users,     label: 'Community' },
  { href: '/profile',   icon: User,      label: 'Profile' },
]

export default function Sidebar({ userName, avatarUrl, rcsScore, branch }: SidebarProps) {
  const pathname = usePathname()

  const firstInitial = userName?.charAt(0)?.toUpperCase() ?? 'S'

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside
        className="hidden md:flex"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 'var(--sidebar-w)',
          height: '100dvh',
          background: 'var(--green-900)',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          zIndex: 50,
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <Link
          href="/home"
          style={{
            width: 38, height: 38,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
            color: '#fff',
            textDecoration: 'none',
            flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
          title="MedMaster AI"
        >
          <Leaf size={18} />
        </Link>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, width: '100%', padding: '0 8px' }}>
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                title={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 44,
                  borderRadius: 10,
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                  position: 'relative',
                }}
                className="sidebar-nav-item"
              >
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                {/* Active dot */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: -8, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 20, background: 'var(--green-400)',
                    borderRadius: '0 3px 3px 0',
                  }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: Avatar + RCS + Sign out */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 8px', width: '100%' }}>
          {/* RCS score pill */}
          <div
            title={`Revision Consistency Score: ${Math.round(rcsScore)}%`}
            style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '4px 8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: rcsScore >= 80 ? 'var(--green-400)' : rcsScore >= 60 ? '#E9C46A' : '#E76F51' }}>
              {Math.round(rcsScore)}%
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              RCS
            </div>
          </div>

          {/* Avatar */}
          <Link href="/profile" title={userName} style={{ textDecoration: 'none' }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }}
              />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--green-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 14, fontWeight: 600,
                border: '2px solid rgba(255,255,255,0.2)',
              }}>
                {firstInitial}
              </div>
            )}
          </Link>

          {/* Sign out */}
          <form action={signOut}>
            <button
              type="submit"
              title="Sign out"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', padding: 8, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.35)')}
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ────────────────────────────────── */}
      <nav
        className="md:hidden"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--green-900)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '10px 0 max(10px, env(safe-area-inset-bottom))',
          zIndex: 50,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, padding: '4px 16px', borderRadius: 8,
                color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                textDecoration: 'none', transition: 'color 0.15s',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span style={{ fontSize: 10 }}>{label}</span>
            </Link>
          )
        })}
      </nav>

      <style>{`
        .sidebar-nav-item:hover {
          color: rgba(255,255,255,0.85) !important;
          background: rgba(255,255,255,0.08) !important;
        }
      `}</style>
    </>
  )
}
