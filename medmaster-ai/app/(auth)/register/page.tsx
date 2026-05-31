'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/lib/actions'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    if (formData.get('password') !== formData.get('confirm_password')) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 26,
          fontWeight: 400,
          color: 'var(--text)',
          marginBottom: 8,
        }}>
          Create your account
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
          Start your structured revision journey today.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field-group">
          <label className="label" htmlFor="full_name">Full name</label>
          <input
            className="input"
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Dr. Rubi Sharma"
            required
          />
        </div>

        <div className="field-group">
          <label className="label" htmlFor="email">Email address</label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="field-group">
          <label className="label" htmlFor="password">Password</label>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>

        <div className="field-group">
          <label className="label" htmlFor="confirm_password">Confirm password</label>
          <input
            className="input"
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            minLength={8}
            required
          />
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {loading ? (
            <><Spinner /> Creating account…</>
          ) : (
            'Create account'
          )}
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6 }}>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-2)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--green-800)', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
