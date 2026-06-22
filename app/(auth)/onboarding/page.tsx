'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { BRANCH_TEMPLATES, getBranchTopicCount } from '@/lib/syllabus-templates'

type Step = 1 | 2 | 3 | 4

interface OnboardingData {
  full_name: string
  college: string
  batch_year: string
  branch: string
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [data, setData] = useState<OnboardingData>({
    full_name: '',
    college: '',
    batch_year: new Date().getFullYear().toString(),
    branch: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof OnboardingData, value: string) =>
    setData(prev => ({ ...prev, [field]: value }))

  async function handleFinish() {
    setLoading(true)
    setError(null)
    const result = await completeOnboarding({
      full_name: data.full_name,
      college: data.college,
      branch: data.branch,
      batch_year: parseInt(data.batch_year),
    })
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // redirect happens inside the action on success
  }

  const selectedTemplate = BRANCH_TEMPLATES.find(t => t.branch === data.branch)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'var(--green-800)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: 'Fraunces, Georgia, serif', fontSize: 16
          }}>M</div>
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 17 }}>MedMaster AI</span>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {([1, 2, 3, 4] as Step[]).map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 500, transition: 'all 0.2s ease',
                background: s === step ? 'var(--green-800)' : s < step ? 'var(--green-100)' : 'var(--surface-2)',
                color: s === step ? '#fff' : s < step ? 'var(--green-800)' : 'var(--text-3)',
              }}>{s < step ? '✓' : s}</div>
              {s < 4 && <div style={{ width: 24, height: 1, background: s < step ? 'var(--green-400)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 560 }} className="animate-slide-up">

          {/* ── Step 1: Profile ── */}
          {step === 1 && (
            <div>
              <p className="section-label" style={{ marginBottom: 8 }}>Step 1 of 4</p>
              <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
                Tell us about yourself
              </h2>
              <p style={{ color: 'var(--text-2)', marginBottom: 32 }}>
                This helps personalise your academic dashboard.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="field-group">
                  <label className="label">Your full name</label>
                  <input
                    className="input"
                    placeholder="Dr. Rubi Sharma"
                    value={data.full_name}
                    onChange={e => update('full_name', e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="label">College / Institution</label>
                  <input
                    className="input"
                    placeholder="e.g. SDM College of Ayurveda, Udupi"
                    value={data.college}
                    onChange={e => update('college', e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="label">Admission year</label>
                  <select
                    className="input"
                    value={data.batch_year}
                    onChange={e => update('batch_year', e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ marginTop: 32, width: '100%' }}
                onClick={() => setStep(2)}
                disabled={!data.full_name.trim() || !data.college.trim()}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 2: Branch Selection ── */}
          {step === 2 && (
            <div>
              <p className="section-label" style={{ marginBottom: 8 }}>Step 2 of 4</p>
              <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
                Select your MD branch
              </h2>
              <p style={{ color: 'var(--text-2)', marginBottom: 32 }}>
                We&apos;ll pre-populate your syllabus based on this. You can customise it later.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {BRANCH_TEMPLATES.map(template => (
                  <button
                    key={template.branch}
                    onClick={() => update('branch', template.branch)}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 'var(--r-lg)',
                      border: `2px solid ${data.branch === template.branch ? 'var(--green-800)' : 'var(--border)'}`,
                      background: data.branch === template.branch ? 'var(--green-50)' : 'var(--surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: data.branch === template.branch ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none',
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>
                      {template.branch.replace('MD ', '')}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {getBranchTopicCount(template.branch)} topics · {template.sections.length} sections
                    </div>
                    {data.branch === template.branch && (
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--green-800)', fontWeight: 500 }}>
                        ✓ Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  onClick={() => setStep(3)}
                  disabled={!data.branch}
                >
                  Preview syllabus →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Syllabus Preview ── */}
          {step === 3 && selectedTemplate && (
            <div>
              <p className="section-label" style={{ marginBottom: 8 }}>Step 3 of 4</p>
              <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 8 }}>
                Your syllabus preview
              </h2>
              <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>
                This is what will be created for you. You can add custom topics anytime.
              </p>

              {/* Stats bar */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
                background: 'var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden',
                marginBottom: 24,
              }}>
                {[
                  { label: 'Sections', value: selectedTemplate.sections.length },
                  { label: 'Topics', value: getBranchTopicCount(data.branch) },
                  { label: 'Branch', value: data.branch.replace('MD ', '') },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'var(--surface)', padding: '14px 18px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 400, color: 'var(--green-800)' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Section list */}
              <div style={{
                maxHeight: 320, overflowY: 'auto',
                border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
                background: 'var(--surface)',
              }}>
                {selectedTemplate.sections.map((section, idx) => (
                  <div
                    key={section.name}
                    style={{
                      padding: '14px 18px',
                      borderBottom: idx < selectedTemplate.sections.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>
                        {section.name}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {section.topics.length} topics
                      </span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
                      {section.topics.slice(0, 2).map(t => t.name).join(' · ')}
                      {section.topics.length > 2 && ` · +${section.topics.length - 2} more`}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep(4)}>
                  Looks good →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Finish ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 24 }}>🌿</div>
              <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 30, fontWeight: 400, marginBottom: 12 }}>
                You&apos;re all set, {data.full_name.split(' ')[0]}
              </h2>
              <p style={{ color: 'var(--text-2)', marginBottom: 8, maxWidth: '36ch', margin: '0 auto 8px' }}>
                Your syllabus is ready. Start by studying your first topic and your revision schedule will be created automatically.
              </p>
              <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 40 }}>
                Revisions will be scheduled at Day 7, 14, 21, 45, and 90.
              </p>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 32, textAlign: 'left',
              }}>
                {[
                  { label: 'Name', value: data.full_name },
                  { label: 'College', value: data.college },
                  { label: 'Branch', value: data.branch },
                  { label: 'Batch', value: data.batch_year },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: 'var(--text-3)' }}>{item.label}</span>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(3)}>
                  ← Back
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 2 }}
                  onClick={handleFinish}
                  disabled={loading}
                >
                  {loading ? <>
                    <Spinner /> Building your syllabus…
                  </> : 'Enter MedMaster →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
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
