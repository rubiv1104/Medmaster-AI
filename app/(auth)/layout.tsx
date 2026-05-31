export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12"
        style={{ background: 'var(--green-900)', color: '#fff' }}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2 mb-16">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'rgba(255,255,255,0.15)', fontFamily: 'var(--font-display, Fraunces)' }}
            >
              M
            </div>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, fontWeight: 400 }}>
              MedMaster <span style={{ opacity: 0.6, fontSize: 14 }}>AI</span>
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(28px, 3vw, 38px)',
              fontWeight: 400,
              lineHeight: 1.2,
              color: '#FFFFFF',
              marginBottom: 20,
            }}
          >
            Retain more.<br />
            Revise smarter.<br />
            Master your syllabus.
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.7, maxWidth: '32ch' }}>
            A personal academic assistant built for MD Ayurveda postgraduate students.
          </p>
        </div>

        {/* Feature highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: '🔄', text: 'Spaced revision at Day 7, 14, 21, 45, 90' },
            { icon: '🧠', text: 'AI-generated revision notes and MCQs' },
            { icon: '📊', text: 'Revision Consistency Score (RCS) tracking' },
            { icon: '🌿', text: 'Built specifically for Ayurveda PG syllabus' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{item.text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          MedMaster AI — Ayurveda PG Edition
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-sm text-white"
              style={{ background: 'var(--green-800)' }}
            >
              M
            </div>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17 }}>
              MedMaster AI
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
