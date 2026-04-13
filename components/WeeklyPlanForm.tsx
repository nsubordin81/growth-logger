'use client'
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface GoalItem { goalId: string; task: string; time: string }
interface FocusArea { goalId: string; status: string }
interface StrugglePattern { name: string; insight: string }
interface ActionItem { deadline: string; goalId: string }

// ─── Tiny shared primitives ────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{
      display: 'block', fontSize: '0.65rem', textTransform: 'uppercase',
      letterSpacing: '0.12em', color: 'var(--dim)', marginBottom: '0.4rem', fontWeight: 500,
    }}>
      {children}{required && <span style={{ color: '#ec4899', marginLeft: '0.2rem' }}>*</span>}
    </label>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  )
}

function TI({ value, onChange, placeholder, autoFocus }: {
  value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean
}) {
  return (
    <input type="text" autoFocus={autoFocus} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '3px' }} />
  )
}

function TA({ value, onChange, placeholder, rows = 2 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      rows={rows}
      style={{ width: '100%', padding: '0.55rem 0.7rem', borderRadius: '3px', lineHeight: 1.6 }} />
  )
}

function GoalChip({ value, onChange }: { value: Goal | ''; onChange: (g: Goal) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {(Object.entries(GOAL_META) as [Goal, typeof GOAL_META[Goal]][]).map(([key, meta]) => {
        const active = value === key
        return (
          <button key={key} onClick={() => onChange(key)} style={{
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

function ScaleBtn({ value, onChange, color = '#ec4899' }: {
  value: number; onChange: (n: number) => void; color?: string
}) {
  return (
    <div style={{ display: 'flex', gap: '0.3rem' }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          width: '2rem', height: '2rem', borderRadius: '3px', fontSize: '0.7rem',
          fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          border: `1px solid ${n <= value ? color : 'var(--border)'}`,
          background: n <= value ? color : 'transparent',
          color: n <= value ? '#000' : 'var(--muted)', transition: 'all 0.12s',
        }}>{n}</button>
      ))}
    </div>
  )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: '1.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.62rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progress</span>
        <span style={{ fontSize: '0.62rem', color: '#ec4899' }}>{pct}%</span>
      </div>
      <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div className="progress-fill"
          style={{ height: '100%', width: `${pct}%`, background: '#ec4899', borderRadius: '2px' }} />
      </div>
    </div>
  )
}

// ─── Goal Item Row ────────────────────────────────────────────────────────────

function GoalItemRow({
  index, prefix, item, onChange, accentColor,
}: {
  index: number; prefix: string; item: GoalItem;
  onChange: (i: GoalItem) => void; accentColor: string
}) {
  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid var(--border)`,
      borderLeft: `3px solid ${accentColor}`, borderRadius: '3px',
      padding: '0.75rem', marginBottom: '0.6rem',
    }}>
      <div style={{ fontSize: '0.62rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
        {prefix} {index + 1}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.45rem' }}>
        <div style={{ width: '110px', flexShrink: 0 }}>
          <GoalChip value={item.goalId as Goal | ''} onChange={g => onChange({ ...item, goalId: g })} />
        </div>
        <input type="text" value={item.time} onChange={e => onChange({ ...item, time: e.target.value })}
          placeholder="~15 min"
          style={{ width: '90px', padding: '0.45rem 0.6rem', borderRadius: '3px', fontSize: '0.72rem', flexShrink: 0 }} />
      </div>
      <TI value={item.task} onChange={v => onChange({ ...item, task: v })}
        placeholder="Specific task — what exactly will you do?" />
    </div>
  )
}

// ─── Dynamic list rows ────────────────────────────────────────────────────────

function FocusAreaRow({ item, onChange, onRemove }: {
  item: FocusArea; onChange: (i: FocusArea) => void; onRemove: () => void
}) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
      <div style={{ width: '110px', flexShrink: 0 }}>
        <GoalChip value={item.goalId as Goal | ''} onChange={g => onChange({ ...item, goalId: g })} />
      </div>
      <input type="text" value={item.status} onChange={e => onChange({ ...item, status: e.target.value })}
        placeholder="Status / note"
        style={{ flex: 1, padding: '0.45rem 0.6rem', borderRadius: '3px' }} />
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--muted)', fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1,
      }}>×</button>
    </div>
  )
}

function PatternRow({ item, onChange, onRemove }: {
  item: StrugglePattern; onChange: (i: StrugglePattern) => void; onRemove: () => void
}) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
      <input type="text" value={item.name} onChange={e => onChange({ ...item, name: e.target.value })}
        placeholder="Pattern name"
        style={{ width: '140px', flexShrink: 0, padding: '0.45rem 0.6rem', borderRadius: '3px' }} />
      <input type="text" value={item.insight} onChange={e => onChange({ ...item, insight: e.target.value })}
        placeholder="Brief insight"
        style={{ flex: 1, padding: '0.45rem 0.6rem', borderRadius: '3px' }} />
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--muted)', fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1,
      }}>×</button>
    </div>
  )
}

function ActionItemRow({ item, onChange, onRemove }: {
  item: ActionItem; onChange: (i: ActionItem) => void; onRemove: () => void
}) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
      <input type="text" value={item.deadline} onChange={e => onChange({ ...item, deadline: e.target.value })}
        placeholder="Deadline or action"
        style={{ flex: 1, padding: '0.45rem 0.6rem', borderRadius: '3px' }} />
      <div style={{ width: '110px', flexShrink: 0 }}>
        <GoalChip value={item.goalId as Goal | ''} onChange={g => onChange({ ...item, goalId: g })} />
      </div>
      <button onClick={onRemove} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--muted)', fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1,
      }}>×</button>
    </div>
  )
}

function AddRowBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      padding: '0.35rem 0.75rem', fontSize: '0.65rem', fontWeight: 600,
      letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'inherit',
      cursor: 'pointer', background: 'transparent',
      border: '1px dashed var(--border)', color: 'var(--muted)',
      borderRadius: '3px', marginTop: '0.2rem', transition: 'all 0.12s',
    }}>+ {label}</button>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function WeeklyPlanForm({
  onDone,
  addToast,
}: {
  onDone: () => void
  addToast: (m: string, ok: boolean) => void
}) {
  const TOTAL_STEPS = 5

  // 3-2-1 goals
  const emptyGoalItem = (): GoalItem => ({ goalId: '', task: '', time: '' })
  const [microGoals, setMicroGoals] = useState<GoalItem[]>([emptyGoalItem(), emptyGoalItem(), emptyGoalItem()])
  const [learningGoals, setLearningGoals] = useState<GoalItem[]>([emptyGoalItem(), emptyGoalItem()])
  const [focusGoal, setFocusGoal] = useState<GoalItem>(emptyGoalItem())

  // Focus areas + patterns
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([{ goalId: '', status: '' }])
  const [strugglePatterns, setStrugglePatterns] = useState<StrugglePattern[]>([{ name: '', insight: '' }])

  // Action items
  const [actionItems, setActionItems] = useState<ActionItem[]>([{ deadline: '', goalId: '' }])

  // Struggle calibration
  const [microTarget, setMicroTarget] = useState(2)
  const [learningTarget, setLearningTarget] = useState(3)
  const [focusTarget, setFocusTarget] = useState(4)

  // Notes
  const [notes, setNotes] = useState('')

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  function updateArr<T>(arr: T[], i: number, val: T): T[] {
    return arr.map((x, j) => j === i ? val : x)
  }
  function removeArr<T>(arr: T[], i: number): T[] {
    return arr.filter((_, j) => j !== i)
  }

  const stepLabels = ['MICRO-GOALS', 'LEARNING + FOCUS', 'CONTEXT', 'ACTIONS', 'CALIBRATE']

  const stepContent = [
    // Step 0: 3 micro goals
    <div key="0" className="animate-fade-up">
      <div style={{ padding: '0.5rem 0.8rem', borderLeft: '2px solid #ec4899', background: 'rgba(236,72,153,0.05)', marginBottom: '1.2rem', fontSize: '0.72rem', color: 'var(--dim)', lineHeight: 1.6 }}>
        ↯ 3 non-negotiable micro-goals. Each should be completable in 10-20 min with no excuses.
      </div>
      {microGoals.map((g, i) => (
        <GoalItemRow key={i} index={i} prefix="Micro-Goal" item={g} accentColor="#ec4899"
          onChange={v => setMicroGoals(arr => updateArr(arr, i, v))} />
      ))}
    </div>,

    // Step 1: Learning goals + focus
    <div key="1" className="animate-fade-up">
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.7rem' }}>
          2 Learning Goals <span style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>(30-45 min combined)</span>
        </div>
        {learningGoals.map((g, i) => (
          <GoalItemRow key={i} index={i} prefix="Learning Goal" item={g} accentColor="#06b6d4"
            onChange={v => setLearningGoals(arr => updateArr(arr, i, v))} />
        ))}
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.7rem' }}>
          1 Focus Goal <span style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>(60-90 min deep work)</span>
        </div>
        <GoalItemRow index={0} prefix="Focus Session" item={focusGoal} accentColor="#3b82f6"
          onChange={setFocusGoal} />
      </div>
    </div>,

    // Step 2: Focus areas + struggle patterns
    <div key="2" className="animate-fade-up">
      <Field label="Weekly focus areas — goal status">
        {focusAreas.map((f, i) => (
          <FocusAreaRow key={i} item={f}
            onChange={v => setFocusAreas(arr => updateArr(arr, i, v))}
            onRemove={() => setFocusAreas(arr => removeArr(arr, i))} />
        ))}
        <AddRowBtn label="Add goal status" onClick={() => setFocusAreas(a => [...a, { goalId: '', status: '' }])} />
      </Field>
      <Field label="Recent struggle patterns">
        {strugglePatterns.map((p, i) => (
          <PatternRow key={i} item={p}
            onChange={v => setStrugglePatterns(arr => updateArr(arr, i, v))}
            onRemove={() => setStrugglePatterns(arr => removeArr(arr, i))} />
        ))}
        <AddRowBtn label="Add pattern" onClick={() => setStrugglePatterns(a => [...a, { name: '', insight: '' }])} />
      </Field>
    </div>,

    // Step 3: Action items
    <div key="3" className="animate-fade-up">
      <div style={{ padding: '0.5rem 0.8rem', borderLeft: '2px solid var(--amber)', background: 'rgba(245,158,11,0.05)', marginBottom: '1.2rem', fontSize: '0.72rem', color: 'var(--dim)', lineHeight: 1.6 }}>
        ↯ Concrete actions with deadlines. These become checkboxes in your markdown file.
      </div>
      <Field label="Action items">
        {actionItems.map((a, i) => (
          <ActionItemRow key={i} item={a}
            onChange={v => setActionItems(arr => updateArr(arr, i, v))}
            onRemove={() => setActionItems(arr => removeArr(arr, i))} />
        ))}
        <AddRowBtn label="Add action" onClick={() => setActionItems(a => [...a, { deadline: '', goalId: '' }])} />
      </Field>
      <Field label="Notes (optional)">
        <TA value={notes} onChange={setNotes} placeholder="Anything else for the week..." rows={3} />
      </Field>
    </div>,

    // Step 4: Struggle calibration
    <div key="4" className="animate-fade-up">
      <div style={{ padding: '0.5rem 0.8rem', borderLeft: '2px solid var(--green)', background: 'rgba(16,185,129,0.05)', marginBottom: '1.2rem', fontSize: '0.72rem', color: 'var(--dim)', lineHeight: 1.6 }}>
        ↯ Set your struggle targets. Too easy = no growth. Too hard = no completion. Calibrate honestly.
      </div>
      <Field label="Micro-Goals struggle target">
        <ScaleBtn value={microTarget} onChange={setMicroTarget} color="#ec4899" />
        <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Suggested: 2-3 — these should be completable</div>
      </Field>
      <Field label="Learning Goals struggle target">
        <ScaleBtn value={learningTarget} onChange={setLearningTarget} color="#06b6d4" />
        <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Suggested: 3-4 — should stretch you</div>
      </Field>
      <Field label="Focus Session struggle target">
        <ScaleBtn value={focusTarget} onChange={setFocusTarget} color="#3b82f6" />
        <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Suggested: 4-5 — deep work is supposed to be hard</div>
      </Field>
    </div>,
  ]

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          microGoals, learningGoals, focusGoal,
          focusAreas, strugglePatterns, actionItems,
          microStruggleTarget: microTarget,
          learningStruggleTarget: learningTarget,
          focusStruggleTarget: focusTarget,
          notes,
        }),
      })
      const data = await res.json()
      if (data.success) {
        addToast(`Plan → ${data.filename}`, true)
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

      {/* Step breadcrumbs */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {stepLabels.map((label, i) => (
          <button key={i} onClick={() => i < step && setStep(i)} style={{
            padding: '0.2rem 0.5rem', fontSize: '0.6rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', fontFamily: 'inherit', borderRadius: '2px',
            cursor: i < step ? 'pointer' : 'default',
            border: `1px solid ${i === step ? '#ec4899' : i < step ? 'var(--green)' : 'var(--border)'}`,
            background: i < step ? 'rgba(16,185,129,0.1)' : 'transparent',
            color: i === step ? '#ec4899' : i < step ? 'var(--green)' : 'var(--muted)',
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
          <button onClick={() => setStep(s => s + 1)} style={{
            padding: '0.5rem 1.25rem', fontSize: '0.7rem', fontWeight: 700,
            fontFamily: 'inherit', cursor: 'pointer', background: '#ec4899',
            border: '1px solid #ec4899', color: '#000', borderRadius: '3px',
            letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s',
          }}>NEXT →</button>
        ) : (
          <button onClick={submit} disabled={submitting} style={{
            padding: '0.5rem 1.5rem', fontSize: '0.7rem', fontWeight: 700,
            fontFamily: 'inherit', cursor: submitting ? 'wait' : 'pointer',
            background: submitting ? 'var(--muted)' : 'var(--green)',
            border: `1px solid ${submitting ? 'var(--muted)' : 'var(--green)'}`,
            color: '#000', borderRadius: '3px', letterSpacing: '0.08em',
            textTransform: 'uppercase', transition: 'all 0.15s',
          }}>
            {submitting ? 'WRITING…' : '✓ SAVE PLAN'}
          </button>
        )}
      </div>
    </div>
  )
}
