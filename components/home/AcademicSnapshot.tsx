import Link from 'next/link'

interface AcademicSnapshotProps {
  rcsScore: number
  totalTopics: number
  studiedTopics: number
  masteredTopics: number
  overdueCount: number
  branch: string
}

function RCSLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 90) return { label: 'Outstanding', color: 'var(--green-900)', bg: 'var(--green-100)' }
  if (score >= 80) return { label: 'Excellent',   color: 'var(--green-800)', bg: 'var(--green-100)' }
  if (score >= 70) return { label: 'Good',         color: 'var(--green-700)', bg: '#D4EEDB' }
  if (score >= 55) return { label: 'Fair',         color: 'var(--amber-800)', bg: 'var(--amber-100)' }
  return               { label: 'Needs Work',    color: 'var(--rose-800)',  bg: 'var(--rose-100)' }
}

function RetentionRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2
  const circumference = 2 * Math.PI * r
  const progress = (score / 100) * circumference
  const color = score >= 80 ? 'var(--green-400)' : score >= 60 ? '#74D0A0' : score >= 40 ? 'var(--amber-400)' : 'var(--rose-400)'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 12, fontWeight: 600, fill: color, fontFamily: 'DM Sans, sans-serif' }}>
        {Math.round(score)}
      </text>
    </svg>
  )
}

export default function AcademicSnapshot({
  rcsScore, totalTopics, studiedTopics, masteredTopics, overdueCount, branch
}: AcademicSnapshotProps) {
  const rcsInfo = RCSLabel(rcsScore)
  const studiedPct = totalTopics > 0 ? Math.round((studiedTopics / totalTopics) * 100) : 0

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>

      {/* RCS — hero metric */}
      <div style={{
        padding: '20px 20px 18px',
        background: 'linear-gradient(135deg, var(--green-900) 0%, var(--green-800) 100%)',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Revision Consistency
            </div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 36, fontWeight: 400, lineHeight: 1, marginBottom: 6 }}>
              {Math.round(rcsScore)}%
            </div>
            <span style={{
              fontSize: 12, fontWeight: 500, padding: '3px 8px', borderRadius: 99,
              background: rcsInfo.bg, color: rcsInfo.color,
            }}>
              {rcsInfo.label}
            </span>
          </div>

          {/* Visual arc */}
          <div style={{ opacity: 0.9 }}>
            <RetentionRing score={rcsScore} size={64} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
        {[
          {
            label: 'Syllabus',
            value: `${studiedPct}%`,
            sub: `${studiedTopics} of ${totalTopics} studied`,
            icon: '📚',
            href: '/syllabus',
          },
          {
            label: 'Mastered',
            value: masteredTopics,
            sub: `${masteredTopics === 1 ? 'topic' : 'topics'} mastered`,
            icon: '🌟',
            href: '/syllabus',
          },
          {
            label: 'Overdue',
            value: overdueCount,
            sub: overdueCount === 0 ? 'Nothing overdue' : `need${overdueCount === 1 ? 's' : ''} attention`,
            icon: overdueCount === 0 ? '✅' : '⚠️',
            href: '/home',
            highlight: overdueCount > 0,
          },
          {
            label: 'Branch',
            value: branch ? branch.replace('MD ', '') : '—',
            sub: branch || 'Not set',
            icon: '🌿',
            href: '/profile',
          },
        ].map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            style={{
              display: 'block',
              padding: '14px 16px',
              background: stat.highlight ? 'var(--amber-100)' : 'var(--surface)',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            className="snapshot-stat"
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 20, fontWeight: 400,
              color: stat.highlight ? 'var(--amber-800)' : 'var(--text)',
              lineHeight: 1,
              marginBottom: 3,
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.3 }}>{stat.sub}</div>
          </Link>
        ))}
      </div>

      <style>{`.snapshot-stat:hover { background: var(--surface-2) !important; }`}</style>
    </div>
  )
}
