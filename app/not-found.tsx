import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 52, marginBottom: 20 }}>🌿</div>
      <h1 style={{
        fontFamily: 'Fraunces, Georgia, serif',
        fontSize: 32, fontWeight: 400,
        color: 'var(--text)', marginBottom: 10,
      }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--text-2)', fontSize: 16, marginBottom: 28, maxWidth: '34ch' }}>
        This page doesn&apos;t exist or you may not have access to it.
      </p>
      <Link href="/home" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  )
}
