'use client'
import { useState } from 'react'

type Goal = 'dev' | 'music' | 'fitness' | 'art' | 'learning' | 'admin' | 'personal'

const GOAL_META: Record<Goal, { label: string; color: string; accent: string }> = {
  dev:      { label: 'DEV',      color: '#3b82f6', accent: 'rgba(59,130,246,0.15)' },
  music:    { label: 'MUSIC',    color: '#8b5cf6', accent: 'rgba(139,92,246,0.15)' },
  fitness:  { label: 'FITNESS',  color: '#10b981', accent: 'rgba(16,185,129,0.15)' },
  art:      { label: 'ART/CG',   color: '#f59e0b', accent: 'rgba(245,158,11,0.15)' },
  learning: { label: 'LEARNING', color: '#06b6d4', accent: 'rgba(6,182,212,0.15)' },
  admin:    { label: 'ADMIN',    color: '#6b7280', accent: 'rgba(107,114,128,0.15)' },
  personal: { label: 'PERSONAL', color: '#ec4899', accent: 'rgba(236,72,153,0.15)' },
}

const ACCENT = '#a78bfa'
const ACCENT_BG = 'rgba(167,139,250,0.12)'
const ACCENT_HOVER = 'rgba(167,139,250,0.05)'

type OutageType = 'Weekend' | 'Holiday' | 'Travel' | 'Illness' | 'Family' | 'Other'

const OUTAGE_TYPES: OutageType[] = ['Weekend', 'Holiday', 'Travel', 'Illness', 'Family', 'Other']

function pad(n: number) { return String(n).padStart(2, '0') }
function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// ─── Tiny shared primitives ───────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{
      display: 'block', fontSize: '0.65rem', textTransform: 'uppercase',
      letterSpacing: '0.12em', color: 'var(--dim)', marginBottom: '0.4rem', fontWeight: 500,
    }}>
      {children}{required && <span style={{ color: ACCENT, marginLeft: '0.2rem' }}>*</span>}
    </label>
  )
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
      {hint && <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: '0.3rem' }}>{hint}</div>}
    </div>
  )
}

function TA({ value, onChange, placeholder, rows = 2, autoFocus }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; autoFocus?: boolean
}) {
  return (
    <textarea autoFocus={autoFocus} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '3px', lineHeight: 1.6 }} />
  )
}

function DateInput({ value, onChange, label, required }: {
  value: string; onChange: (v: string) => void; label: string; required?: boolean
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input type="date" value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: '0.55rem 0.7rem', borderRadius: '3px', width: '160px' }} />
    </div>
  )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: '1.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.62rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progress</span>
        <span style={{ fontSize: '0.62rem', color: ACCENT }}>{pct}%</span>
      </div>
      <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div className="progress-fill"
          style={{ height: '100%', width: `${pct}%`, background: ACCENT, borderRadius: '2px' }} />
      </div>
    </div>
  )
}

function GoalMultiSelect({ selected, onChange }: { selected: Goal[]; onChange: (g: Goal[]) => void }) {
  function toggle(g: Goal) {
    onChange(selected.includes(g) ? selected.filter(x => x !== g) : [...selected, g])
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {(Object.entries(GOAL_META) as [Goal, typeof GOAL_META[Goal]][]).map(([key, meta]) => {
        const active = selected.includes(key)
        return (
          <button key={key} onClick={() => toggle(key)} style={{
            padding: '0.25rem 0.6rem', borderRadius: '2px', fontSize: '0.65rem', fontWeight: 600,
            letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer',
            border: `1px solid ${active ? meta.color : 'var(--border)'}`,
            background: active ? meta.accent : 'transparent',
            color: active ? meta.color : 'var(--muted)', transition: 'all 0.12s',
          }}>{meta.label}</button>
        )
      })}
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function OutageForm({
  onDone,
  addToast,
}: {
  onDone: () => void
  addToast: (m: string, ok: boolean) => void
}) {
  const TOTAL_STEPS = 3

  const [startDate, setStartDate] = useState(todayISO)
  const [endDate, setEndDate] = useState(todayISO)
  const [outageType, setOutageType] = useState<OutageType | ''>('')
  const [outageTypeCustom, setOutageTypeCustom] = useState('')
  const [goalsAffected, setGoalsAffected] = useState<Goal[]>([])
  const [expectedResumption, setExpectedResumption] = useState('')

  const [what, setWhat] = useState('')
  const [mentalPractice, setMentalPractice] = useState('')
  const [microActivities, setMicroActivities] = useState('')

  const [reflection, setReflection] = useState('')
  const [howFelt, setHowFelt] = useState('')
  const [agentContext, setAgentContext] = useState('')

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const stepLabels = ['WHEN / TYPE', 'ACTIVITIES', 'REFLECT']

  const stepContent = [
    // Step 0: dates, type, goals affected
    <div key="0" className="animate-fade-up">
      <div style={{
        padding: '0.5rem 0.8rem', borderLeft: `2px solid ${ACCENT}`,
        background: ACCENT_BG, marginBottom: '1.2rem',
        fontSize: '0.72rem', color: 'var(--dim)', lineHeight: 1.6,
      }}>
        ◌ An outage is any period where your normal routines are offline — weekends, travel, illness, family commitments. Logging it tells your agent not to count this window against your goal progress.
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
        <DateInput label="Start date" required value={startDate} onChange={setStartDate} />
        <DateInput label="End date" value={endDate} onChange={setEndDate} />
      </div>

      <Field label="Expected routine resumption">
        <input type="date" value={expectedResumption} onChange={e => setExpectedResumption(e.target.value)}
          style={{ padding: '0.55rem 0.7rem', borderRadius: '3px', width: '160px' }} />
      </Field>

      <Field label="Outage type" required>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {OUTAGE_TYPES.map(t => {
            const active = outageType === t
            return (
              <button key={t} onClick={() => setOutageType(t)} style={{
                padding: '0.3rem 0.75rem', borderRadius: '2px', fontSize: '0.68rem', fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer',
                border: `1px solid ${active ? ACCENT : 'var(--border)'}`,
                background: active ? ACCENT_BG : 'transparent',
                color: active ? ACCENT : 'var(--muted)', transition: 'all 0.12s',
              }}>{t}</button>
            )
          })}
        </div>
        {outageType === 'Other' && (
          <input type="text" value={outageTypeCustom} onChange={e => setOutageTypeCustom(e.target.value)}
            placeholder="Describe the outage type..."
            style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '3px', marginTop: '0.5rem' }} />
        )}
      </Field>

      <Field label="Goals affected" hint="Which areas will have reduced activity during this period?">
        <GoalMultiSelect selected={goalsAffected} onChange={setGoalsAffected} />
      </Field>
    </div>,

    // Step 1: what happened, mental practice, micro activities
    <div key="1" className="animate-fade-up">
      <div style={{
        padding: '0.5rem 0.8rem', borderLeft: `2px solid ${ACCENT}`,
        background: ACCENT_BG, marginBottom: '1.2rem',
        fontSize: '0.72rem', color: 'var(--dim)', lineHeight: 1.6,
      }}>
        ◌ Even during outages, something usually happens. Log what you can — passive maintenance counts. Leave fields blank if genuinely nothing.
      </div>

      <Field label="What happened" hint="Any goal-adjacent activity, even passive or accidental">
        <TA autoFocus value={what} onChange={setWhat}
          placeholder="e.g. listened to a music theory podcast on the drive, chatted with family about career goals..."
          rows={3} />
      </Field>

      <Field label="Mental practice" hint="Visualization, rehearsal, problem-solving in your head">
        <TA value={mentalPractice} onChange={setMentalPractice}
          placeholder="e.g. ran through the song structure in my head, thought about how I'd approach the optimizer refactor..."
          rows={2} />
      </Field>

      <Field label="Micro-activities" hint="Any 5-10 min bursts that still happened">
        <TA value={microActivities} onChange={setMicroActivities}
          placeholder="e.g. 5 min guitar warmup at hotel, read one article about data architecture..."
          rows={2} />
      </Field>
    </div>,

    // Step 2: reflection + agent context
    <div key="2" className="animate-fade-up">
      <Field label="Reflection">
        <TA autoFocus value={reflection} onChange={setReflection}
          placeholder="Key insight or question that surfaced during the outage..."
          rows={3} />
      </Field>

      <Field label="How I felt">
        <TA value={howFelt} onChange={setHowFelt}
          placeholder="Recharged, guilty, disconnected, grateful, restless..."
          rows={2} />
      </Field>

      <Field
        label="Agent context"
        hint="Optional extra note for your LLM — reasoning about why this period should or shouldn't affect goal scoring"
      >
        <TA value={agentContext} onChange={setAgentContext}
          placeholder="e.g. This was a planned family trip — missed sessions are expected and shouldn't trigger any concern about goal momentum. Resume tracking from the resumption date."
          rows={3} />
      </Field>

      {/* Preview */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderLeft: `3px solid ${ACCENT}`, borderRadius: '3px', padding: '0.9rem',
        marginTop: '0.5rem',
      }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Preview
        </div>
        <div style={{ color: ACCENT, fontSize: '0.68rem', fontWeight: 700 }}>OUTAGE MODE</div>
        <div style={{ color: 'var(--bright)', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.2rem' }}>
          {startDate}{endDate && endDate !== startDate ? ` → ${endDate}` : ''} · {outageType || '—'}
        </div>
        {goalsAffected.length > 0 && (
          <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
            Affects: {goalsAffected.map(g => GOAL_META[g].label).join(', ')}
          </div>
        )}
        {expectedResumption && (
          <div style={{ fontSize: '0.68rem', color: 'var(--dim)', marginTop: '0.15rem' }}>
            Resumes: {expectedResumption}
          </div>
        )}
      </div>
    </div>,
  ]

  const canProceed = [
    startDate && outageType,
    true,
    true,
  ][step]

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/outage-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate, endDate, outageType, outageTypeCustom,
          what, mentalPractice, microActivities,
          reflection, howFelt, agentContext,
          goalsAffected, expectedResumption,
        }),
      })
      const data = await res.json()
      if (data.success) {
        addToast(`Outage logged → ${data.filename}`, true)
        onDone()
      } else {
        addToast(`Error: ${data.error}`, false)
      }
    } catch {
      addToast('Network error — is the server running?', false)
    }
    setSubmitting(false)
  }

  return (
    <div>
      <ProgressBar current={step + 1} total={TOTAL_STEPS} />

      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {stepLabels.map((label, i) => (
          <button key={i} onClick={() => i < step && setStep(i)} style={{
            padding: '0.2rem 0.5rem', fontSize: '0.6rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', fontFamily: 'inherit', borderRadius: '2px',
            cursor: i < step ? 'pointer' : 'default',
            border: `1px solid ${i === step ? ACCENT : i < step ? 'var(--green)' : 'var(--border)'}`,
            background: i < step ? 'rgba(16,185,129,0.1)' : 'transparent',
            color: i === step ? ACCENT : i < step ? 'var(--green)' : 'var(--muted)',
          }}>
            {i < step ? '✓ ' : ''}{label}
          </button>
        ))}
      </div>

      {stepContent[step]}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : onDone()}
          style={{
            padding: '0.5rem 1rem', fontSize: '0.7rem', fontFamily: 'inherit',
            cursor: 'pointer', background: 'transparent',
            border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '3px',
          }}>
          {step === 0 ? '← CANCEL' : '← BACK'}
        </button>
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed}
            style={{
              padding: '0.5rem 1.25rem', fontSize: '0.7rem', fontWeight: 700,
              fontFamily: 'inherit', cursor: canProceed ? 'pointer' : 'not-allowed',
              background: canProceed ? ACCENT : 'var(--surface)',
              border: `1px solid ${canProceed ? ACCENT : 'var(--border)'}`,
              color: canProceed ? '#000' : 'var(--muted)', borderRadius: '3px',
              letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s',
            }}>
            NEXT →
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            style={{
              padding: '0.5rem 1.5rem', fontSize: '0.7rem', fontWeight: 700,
              fontFamily: 'inherit', cursor: submitting ? 'wait' : 'pointer',
              background: submitting ? 'var(--muted)' : 'var(--green)',
              border: `1px solid ${submitting ? 'var(--muted)' : 'var(--green)'}`,
              color: '#000', borderRadius: '3px', letterSpacing: '0.08em',
              textTransform: 'uppercase', transition: 'all 0.15s',
            }}>
            {submitting ? 'WRITING…' : '✓ LOG OUTAGE'}
          </button>
        )}
      </div>
    </div>
  )
}
