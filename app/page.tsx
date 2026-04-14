'use client'
import { useState, useRef, useEffect } from 'react'
import WeeklyPlanForm from '../components/WeeklyPlanForm'
import OutageForm from '../components/OutageForm'

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'home' | 'quick-log' | 'snapshot' | 'weekly-plan' | 'outage'
type Goal = 'dev' | 'music' | 'fitness' | 'art' | 'learning' | 'admin' | 'personal'
type StruggleType = 'cognitive' | 'physical' | 'emotional' | 'none'

interface Toast {
  id: number
  message: string
  ok: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function nowHHMM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const GOAL_META: Record<Goal, { label: string; color: string; accent: string }> = {
  dev:      { label: 'DEV',      color: '#3b82f6', accent: 'rgba(59,130,246,0.15)' },
  music:    { label: 'MUSIC',    color: '#8b5cf6', accent: 'rgba(139,92,246,0.15)' },
  fitness:  { label: 'FITNESS',  color: '#10b981', accent: 'rgba(16,185,129,0.15)' },
  art:      { label: 'ART/CG',   color: '#f59e0b', accent: 'rgba(245,158,11,0.15)' },
  learning: { label: 'LEARNING', color: '#06b6d4', accent: 'rgba(6,182,212,0.15)' },
  admin:    { label: 'ADMIN',    color: '#6b7280', accent: 'rgba(107,114,128,0.15)' },
  personal: { label: 'PERSONAL', color: '#ec4899', accent: 'rgba(236,72,153,0.15)' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Progress
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--amber)' }}>{pct}%</span>
      </div>
      <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
        <div
          className="progress-fill"
          style={{ height: '100%', width: `${pct}%`, background: 'var(--amber)', borderRadius: '2px' }}
        />
      </div>
    </div>
  )
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{
      display: 'block',
      fontSize: '0.65rem',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: 'var(--dim)',
      marginBottom: '0.4rem',
      fontWeight: 500,
    }}>
      {children}
      {required && <span style={{ color: 'var(--amber)', marginLeft: '0.2rem' }}>*</span>}
    </label>
  )
}

function TextArea({
  value, onChange, placeholder, rows = 3, autoFocus
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; autoFocus?: boolean
}) {
  return (
    <textarea
      autoFocus={autoFocus}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '0.6rem 0.75rem',
        borderRadius: '3px',
        lineHeight: 1.6,
      }}
    />
  )
}

function TextInput({
  value, onChange, placeholder, autoFocus
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean
}) {
  return (
    <input
      autoFocus={autoFocus}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '0.6rem 0.75rem',
        borderRadius: '3px',
      }}
    />
  )
}

function GoalPicker({ value, onChange }: { value: Goal | ''; onChange: (g: Goal) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
      {(Object.entries(GOAL_META) as [Goal, typeof GOAL_META[Goal]][]).map(([key, meta]) => {
        const active = value === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '2px',
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: `1px solid ${active ? meta.color : 'var(--border)'}`,
              background: active ? meta.accent : 'transparent',
              color: active ? meta.color : 'var(--muted)',
              transition: 'all 0.15s',
            }}
          >
            {meta.label}
          </button>
        )
      })}
    </div>
  )
}

function ScaleButtons({ value, onChange, color = 'var(--amber)' }: {
  value: number; onChange: (n: number) => void; color?: string
}) {
  return (
    <div style={{ display: 'flex', gap: '0.35rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: '2.2rem',
            height: '2.2rem',
            borderRadius: '3px',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
            border: `1px solid ${n <= value ? color : 'var(--border)'}`,
            background: n <= value ? color : 'transparent',
            color: n <= value ? '#000' : 'var(--muted)',
            transition: 'all 0.12s',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function ToggleButton({ value, onChange, label }: {
  value: boolean; onChange: (v: boolean) => void; label: string
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        padding: '0.35rem 0.9rem',
        borderRadius: '3px',
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontFamily: 'inherit',
        cursor: 'pointer',
        border: `1px solid ${value ? 'var(--amber)' : 'var(--border)'}`,
        background: value ? 'rgba(245,158,11,0.15)' : 'transparent',
        color: value ? 'var(--amber)' : 'var(--muted)',
        transition: 'all 0.15s',
      }}
    >
      {value ? '● YES' : '○ NO'} — {label}
    </button>
  )
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim().replace(/^#/, '').replace(/\s+/g, '-')
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: tags.length ? '0.5rem' : 0 }}>
        {tags.map(t => (
          <span key={t} className="tag" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--dim)',
          }}>
            #{t}
            <button
              onClick={() => onChange(tags.filter(x => x !== t))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, marginLeft: '0.15rem', fontFamily: 'inherit' }}
            >×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() } }}
          placeholder="type tag + enter"
          style={{ flex: 1, padding: '0.5rem 0.6rem', borderRadius: '3px' }}
        />
        <button
          onClick={add}
          style={{
            padding: '0 0.8rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--dim)',
            borderRadius: '3px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.75rem',
          }}
        >+ ADD</button>
      </div>
    </div>
  )
}

function ActionItemsInput({ items, onChange }: { items: string[]; onChange: (i: string[]) => void }) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (trimmed) { onChange([...items, trimmed]) }
    setInput('')
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.3rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--amber)', fontSize: '0.7rem', minWidth: '1rem' }}>□</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text)', flex: 1 }}>{item}</span>
          <button
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'inherit' }}
          >×</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: items.length ? '0.5rem' : 0 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="add action item + enter"
          style={{ flex: 1, padding: '0.5rem 0.6rem', borderRadius: '3px' }}
        />
        <button
          onClick={add}
          style={{
            padding: '0 0.8rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--dim)',
            borderRadius: '3px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.75rem',
          }}
        >+ ADD</button>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  )
}

// ─── Quick Log Form ───────────────────────────────────────────────────────────

function QuickLogForm({ onDone, addToast }: { onDone: () => void; addToast: (m: string, ok: boolean) => void }) {
  const [step, setStep] = useState(0)
  const [startTime, setStartTime] = useState(nowHHMM)
  const [endTime, setEndTime] = useState('')
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState<Goal | ''>('')
  const [what, setWhat] = useState('')
  const [whyMatters, setWhyMatters] = useState('')
  const [howFelt, setHowFelt] = useState('')
  const [struggleLevel, setStruggleLevel] = useState(0)
  const [struggleType, setStruggleType] = useState<StruggleType>('cognitive')
  const [lowEffortReward, setLowEffortReward] = useState(false)
  const [lowEffortRewardNote, setLowEffortRewardNote] = useState('')
  const [keyInsight, setKeyInsight] = useState('')
  const [actionItems, setActionItems] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const TOTAL_STEPS = 5

  const stepContent = [
    // Step 0: When + Goal
    <div key="0" className="animate-fade-up">
      <Field label="Session start time" required>
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', borderRadius: '3px', width: '140px' }}
        />
      </Field>
      <Field label="Session end time">
        <input
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          style={{ padding: '0.6rem 0.75rem', borderRadius: '3px', width: '140px' }}
        />
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Leave blank to record end later</div>
      </Field>
      <Field label="Session title" required>
        <TextInput
          value={title}
          onChange={setTitle}
          placeholder="e.g. Slalom Work — UDX Optimizer"
        />
      </Field>
      <Field label="Goal area" required>
        <GoalPicker value={goal} onChange={setGoal} />
      </Field>
    </div>,

    // Step 1: What + Why
    <div key="1" className="animate-fade-up">
      <Field label="What did you do?" required>
        <TextArea
          autoFocus
          value={what}
          onChange={setWhat}
          placeholder="Activities, tasks, what happened. Be specific enough that future-you knows what was going on."
          rows={5}
        />
      </Field>
      <Field label="Why does it matter?">
        <TextArea
          value={whyMatters}
          onChange={setWhyMatters}
          placeholder="Connect this to a goal. Food on the table, skill growth, maintenance..."
          rows={3}
        />
      </Field>
    </div>,

    // Step 2: Feeling + Struggle
    <div key="2" className="animate-fade-up">
      <Field label="How did you feel?">
        <TextArea
          autoFocus
          value={howFelt}
          onChange={setHowFelt}
          placeholder="Nervous, energized, overwhelmed, frustrated, proud..."
          rows={2}
        />
      </Field>
      <Field label="Struggle level (beneficial)">
        <ScaleButtons value={struggleLevel} onChange={setStruggleLevel} />
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
          1 = smooth, no growth &nbsp;·&nbsp; 5 = deeply challenged, neuroplasticity firing
        </div>
      </Field>
      <Field label="Type of struggle">
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['cognitive', 'physical', 'emotional', 'none'] as StruggleType[]).map(t => (
            <button
              key={t}
              onClick={() => setStruggleType(t)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '2px',
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
                cursor: 'pointer',
                border: `1px solid ${struggleType === t ? 'var(--amber)' : 'var(--border)'}`,
                background: struggleType === t ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: struggleType === t ? 'var(--amber)' : 'var(--muted)',
                transition: 'all 0.12s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Low-effort reward?">
        <ToggleButton value={lowEffortReward} onChange={setLowEffortReward} label="did I reach for an easy dopamine hit?" />
        {lowEffortReward && (
          <div style={{ marginTop: '0.5rem' }}>
            <TextInput
              value={lowEffortRewardNote}
              onChange={setLowEffortRewardNote}
              placeholder="What was it? Social media, snacks, YouTube..."
            />
          </div>
        )}
      </Field>
    </div>,

    // Step 3: Insight + Action items
    <div key="3" className="animate-fade-up">
      <Field label="Key insight for future-me">
        <TextArea
          autoFocus
          value={keyInsight}
          onChange={setKeyInsight}
          placeholder="What should you remember? Patterns noticed, decisions made, lessons. Write to yourself directly."
          rows={4}
        />
      </Field>
      <Field label="Action items (optional)">
        <ActionItemsInput items={actionItems} onChange={setActionItems} />
      </Field>
    </div>,

    // Step 4: Tags + confirm
    <div key="4" className="animate-fade-up">
      <Field label="Tags">
        <TagInput tags={tags} onChange={setTags} />
      </Field>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '1rem',
        marginTop: '0.5rem',
      }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>
          Preview
        </div>
        {goal && (
          <div style={{ color: GOAL_META[goal as Goal]?.color, fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            [{GOAL_META[goal as Goal]?.label}]
          </div>
        )}
        <div style={{ color: 'var(--bright)', fontSize: '0.8rem', fontWeight: 600 }}>
          {startTime}{endTime ? ` → ${endTime}` : ''} — {title || '(untitled)'}
        </div>
        {what && <div style={{ color: 'var(--text)', fontSize: '0.72rem', marginTop: '0.4rem', lineHeight: 1.5 }}>{what.slice(0, 120)}{what.length > 120 ? '…' : ''}</div>}
      </div>
    </div>,
  ]

  const canProceed = [
    title.trim() && goal,
    what.trim(),
    true,
    true,
    true,
  ][step]

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/quick-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime, endTime, title, goal, what, whyMatters, howFelt,
          struggleLevel, struggleType, lowEffortReward, lowEffortRewardNote,
          keyInsight, actionItems, tags,
        }),
      })
      const data = await res.json()
      if (data.success) {
        addToast(`Logged → ${data.filename}`, true)
        onDone()
      } else {
        addToast(`Error: ${data.error}`, false)
      }
    } catch {
      addToast('Network error — is the server running?', false)
    }
    setSubmitting(false)
  }

  const stepLabels = ['WHEN / WHERE', 'WHAT / WHY', 'FEEL / STRUGGLE', 'INSIGHT', 'CONFIRM']

  return (
    <div>
      <ProgressBar current={step + 1} total={TOTAL_STEPS} />
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {stepLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => i < step && setStep(i)}
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              borderRadius: '2px',
              cursor: i < step ? 'pointer' : 'default',
              border: `1px solid ${i === step ? 'var(--amber)' : i < step ? 'var(--green)' : 'var(--border)'}`,
              background: i < step ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: i === step ? 'var(--amber)' : i < step ? 'var(--green)' : 'var(--muted)',
            }}
          >
            {i < step ? '✓ ' : ''}{label}
          </button>
        ))}
      </div>

      {stepContent[step]}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : onDone()}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.7rem',
            fontFamily: 'inherit',
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            borderRadius: '3px',
          }}
        >
          {step === 0 ? '← CANCEL' : '← BACK'}
        </button>
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: canProceed ? 'pointer' : 'not-allowed',
              background: canProceed ? 'var(--amber)' : 'var(--surface)',
              border: `1px solid ${canProceed ? 'var(--amber)' : 'var(--border)'}`,
              color: canProceed ? '#000' : 'var(--muted)',
              borderRadius: '3px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}
          >
            NEXT →
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: submitting ? 'wait' : 'pointer',
              background: submitting ? 'var(--muted)' : 'var(--green)',
              border: `1px solid ${submitting ? 'var(--muted)' : 'var(--green)'}`,
              color: '#000',
              borderRadius: '3px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}
          >
            {submitting ? 'WRITING…' : '✓ LOG IT'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Snapshot Form ────────────────────────────────────────────────────────────

function SnapshotForm({ onDone, addToast }: { onDone: () => void; addToast: (m: string, ok: boolean) => void }) {
  const [step, setStep] = useState(0)
  const [topic, setTopic] = useState('')
  const [domain, setDomain] = useState<Goal | ''>('')
  const [recallAttempt, setRecallAttempt] = useState('')
  const [actualKnowledge, setActualKnowledge] = useState('')
  const [confusions, setConfusions] = useState('')
  const [insight, setInsight] = useState('')
  const [microChallenge, setMicroChallenge] = useState('')
  const [confidenceLevel, setConfidenceLevel] = useState(0)
  const [sources, setSources] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const TOTAL_STEPS = 4

  const stepContent = [
    // Step 0: Topic + domain
    <div key="0" className="animate-fade-up">
      <Field label="Topic / subject" required>
        <TextInput
          autoFocus
          value={topic}
          onChange={setTopic}
          placeholder="e.g. UDX Constrained Optimizer Graph Representation"
        />
      </Field>
      <Field label="Domain">
        <GoalPicker value={domain} onChange={setDomain} />
      </Field>
      <Field label="Confidence after recall">
        <ScaleButtons value={confidenceLevel} onChange={setConfidenceLevel} color="#06b6d4" />
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
          1 = guessing &nbsp;·&nbsp; 5 = I could teach this right now
        </div>
      </Field>
    </div>,

    // Step 1: Recall attempt
    <div key="1" className="animate-fade-up">
      <div style={{ padding: '0.6rem 0.9rem', borderLeft: '2px solid var(--amber)', background: 'rgba(245,158,11,0.05)', marginBottom: '1rem', fontSize: '0.72rem', color: 'var(--dim)', lineHeight: 1.6 }}>
        ↯ Don't look anything up. Write everything you can recall about this topic. This is the active retrieval part — the hard work that builds memory.
      </div>
      <Field label="My recall attempt" required>
        <TextArea
          autoFocus
          value={recallAttempt}
          onChange={setRecallAttempt}
          placeholder="Write freely. What do you think you know? Intuitions, half-remembered details, things you're not sure about. Don't filter."
          rows={8}
        />
      </Field>
    </div>,

    // Step 2: Verify + confusions
    <div key="2" className="animate-fade-up">
      <Field label="What I actually knew / verified">
        <TextArea
          autoFocus
          value={actualKnowledge}
          onChange={setActualKnowledge}
          placeholder="After checking: what did you get right, what was off? What did an LLM or source confirm?"
          rows={4}
        />
      </Field>
      <Field label="Confusions / gaps">
        <TextArea
          value={confusions}
          onChange={setConfusions}
          placeholder="Where did your model break down? What do you still not understand?"
          rows={3}
        />
      </Field>
    </div>,

    // Step 3: Insight + challenge
    <div key="3" className="animate-fade-up">
      <Field label="My insight">
        <TextArea
          autoFocus
          value={insight}
          onChange={setInsight}
          placeholder="What clicked? A new connection, a pattern you noticed, something that will stick."
          rows={3}
        />
      </Field>
      <Field label="My micro-challenge">
        <TextArea
          value={microChallenge}
          onChange={setMicroChallenge}
          placeholder="Set yourself a concrete next action: write pseudo-code, explain to someone, build a mini-example..."
          rows={2}
        />
      </Field>
      <Field label="Sources / references (optional)">
        <TagInput tags={sources} onChange={setSources} />
      </Field>
    </div>,
  ]

  const canProceed = [
    topic.trim() !== '',
    recallAttempt.trim() !== '',
    true,
    true,
  ][step]

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch('/api/learning-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, domain, recallAttempt, actualKnowledge, confusions, insight, microChallenge, confidenceLevel, sources }),
      })
      const data = await res.json()
      if (data.success) {
        addToast(`Snapshot → ${data.filename}`, true)
        onDone()
      } else {
        addToast(`Error: ${data.error}`, false)
      }
    } catch {
      addToast('Network error — is the server running?', false)
    }
    setSubmitting(false)
  }

  const stepLabels = ['TOPIC', 'RECALL', 'VERIFY', 'INSIGHT']

  return (
    <div>
      <ProgressBar current={step + 1} total={TOTAL_STEPS} />
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {stepLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => i < step && setStep(i)}
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              borderRadius: '2px',
              cursor: i < step ? 'pointer' : 'default',
              border: `1px solid ${i === step ? '#06b6d4' : i < step ? 'var(--green)' : 'var(--border)'}`,
              background: i < step ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: i === step ? '#06b6d4' : i < step ? 'var(--green)' : 'var(--muted)',
            }}
          >
            {i < step ? '✓ ' : ''}{label}
          </button>
        ))}
      </div>

      {stepContent[step]}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : onDone()}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.7rem',
            fontFamily: 'inherit',
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            borderRadius: '3px',
          }}
        >
          {step === 0 ? '← CANCEL' : '← BACK'}
        </button>
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: canProceed ? 'pointer' : 'not-allowed',
              background: canProceed ? '#06b6d4' : 'var(--surface)',
              border: `1px solid ${canProceed ? '#06b6d4' : 'var(--border)'}`,
              color: canProceed ? '#000' : 'var(--muted)',
              borderRadius: '3px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}
          >
            NEXT →
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: submitting ? 'wait' : 'pointer',
              background: submitting ? 'var(--muted)' : 'var(--green)',
              border: `1px solid ${submitting ? 'var(--muted)' : 'var(--green)'}`,
              color: '#000',
              borderRadius: '3px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}
          >
            {submitting ? 'WRITING…' : '✓ SNAPSHOT'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────

type HomeButtonProps = {
  onClick: () => void
  accentColor: string
  hoverBg: string
  icon: string
  label: string
  subtitle: string
}

function HomeButton({ onClick, accentColor, hoverBg, icon, label, subtitle }: HomeButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '1rem 1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${accentColor}`,
        color: 'var(--bright)',
        fontFamily: 'inherit',
        fontSize: '0.8rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        textAlign: 'left',
        borderRadius: '3px',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = hoverBg }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)' }}
    >
      <div>
        <div>{icon} {label}</div>
        <div style={{ fontSize: '0.62rem', color: 'var(--dim)', fontWeight: 400, marginTop: '0.2rem', letterSpacing: '0.05em', textTransform: 'none' }}>
          {subtitle}
        </div>
      </div>
      <span style={{ color: 'var(--muted)' }}>→</span>
    </button>
  )
}

function Home({ onSelect }: { onSelect: (m: Mode) => void }) {
  const [time, setTime] = useState(nowHHMM)

  useEffect(() => {
    const id = setInterval(() => setTime(nowHHMM()), 10000)
    return () => clearInterval(id)
  }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="animate-fade-up" style={{ textAlign: 'center', padding: '2rem 0' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: 'clamp(3rem, 12vw, 7rem)',
          letterSpacing: '0.05em',
          color: 'var(--bright)',
          lineHeight: 1,
          marginBottom: '0.2rem',
        }}>
          {time}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {today}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '320px', margin: '0 auto' }}>
        <HomeButton
          onClick={() => onSelect('quick-log')}
          accentColor="var(--amber)"
          hoverBg="rgba(245,158,11,0.05)"
          icon="⬛"
          label="QUICK LOG"
          subtitle="Session · feelings · struggle · insight"
        />
        <HomeButton
          onClick={() => onSelect('snapshot')}
          accentColor="#06b6d4"
          hoverBg="rgba(6,182,212,0.05)"
          icon="◈"
          label="LEARNING SNAPSHOT"
          subtitle="Recall · verify · insight · micro-challenge"
        />
        <HomeButton
          onClick={() => onSelect('weekly-plan')}
          accentColor="#ec4899"
          hoverBg="rgba(236,72,153,0.05)"
          icon="◆"
          label="WEEKLY PLAN"
          subtitle="3-2-1 goals · focus areas · struggle calibration"
        />
        <HomeButton
          onClick={() => onSelect('outage')}
          accentColor="#a78bfa"
          hoverBg="rgba(167,139,250,0.05)"
          icon="◌"
          label="OUTAGE LOG"
          subtitle="Weekend · travel · offline · context for your agent"
        />
      </div>

      <div style={{ marginTop: '3rem', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
        <span className="pulse-dot" style={{ marginRight: '0.4rem' }} />
        LOGGING TO ~/growth_mind/raw/
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 100 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className="animate-slide-in"
          style={{
            padding: '0.6rem 1rem',
            background: t.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${t.ok ? 'var(--green)' : 'var(--red)'}`,
            color: t.ok ? 'var(--green)' : '#ef4444',
            borderRadius: '3px',
            fontSize: '0.72rem',
            fontFamily: 'inherit',
            maxWidth: '280px',
          }}
        >
          {t.ok ? '✓ ' : '✗ '}{t.message}
        </div>
      ))}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<Mode>('home')
  const [toasts, setToasts] = useState<Toast[]>([])

  function addToast(message: string, ok: boolean) {
    const id = Date.now()
    setToasts(t => [...t, { id, message, ok }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  const modeTitle: Record<Mode, string> = {
    home: 'GROWTH LOGGER',
    'quick-log': 'QUICK LOG',
    snapshot: 'LEARNING SNAPSHOT',
    'weekly-plan': 'WEEKLY PLAN',
    outage: 'OUTAGE LOG',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: 'var(--ink)',
      }}>
        <button
          onClick={() => setMode('home')}
          style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: '1.1rem',
            letterSpacing: '0.15em',
            color: mode === 'home' ? 'var(--amber)' : 'var(--muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'color 0.15s',
          }}
        >
          GROWTH LOGGER
        </button>
        {mode !== 'home' && (
          <>
            <span style={{ color: 'var(--border)' }}>›</span>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--dim)', textTransform: 'uppercase' }}>
              {modeTitle[mode]}
            </span>
          </>
        )}
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: '640px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {mode === 'home' && <Home onSelect={setMode} />}
        {mode === 'quick-log' && <QuickLogForm onDone={() => setMode('home')} addToast={addToast} />}
        {mode === 'snapshot' && <SnapshotForm onDone={() => setMode('home')} addToast={addToast} />}
        {mode === 'weekly-plan' && <WeeklyPlanForm onDone={() => setMode('home')} addToast={addToast} />}
        {mode === 'outage' && <OutageForm onDone={() => setMode('home')} addToast={addToast} />}
      </main>

      <Toasts toasts={toasts} />
    </div>
  )
}
