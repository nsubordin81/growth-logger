'use client'
import { useState, useEffect } from 'react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'home' | 'quick-log' | 'snapshot' | 'daily-check' | 'weekly-plan'
type Goal = 'dev' | 'music' | 'fitness' | 'art' | 'learning' | 'admin' | 'personal'

interface Toast {
  id: number
  message: string
  ok: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOAL_META: Record<Goal, { label: string; color: string; accent: string }> = {
  dev:    { label: 'DEV',    color: '#3b82f6', accent: 'rgba(59,130,246,0.15)' },
  music:  { label: 'MUSIC',  color: '#8b5cf6', accent: 'rgba(139,92,246,0.15)' },
  fitness:{ label: 'FITNESS',color: '#10b981', accent: 'rgba(16,185,129,0.15)' },
  art:    { label: 'ART',    color: '#f59e0b', accent: 'rgba(245,158,11,0.15)' },
  learning:{ label: 'LEARN', color: '#06b6d4', accent: 'rgba(6,182,212,0.15)' },
  admin:  { label: 'ADMIN',  color: '#6b7280', accent: 'rgba(107,114,128,0.15)' },
  personal:{ label: 'AUTO',  color: '#ec4899', accent: 'rgba(236,72,153,0.15)' },
}

const PRIORITY_ITEMS = [
  { id: 'morning', label: '⏰ Morning (before 9 AM)', color: '#f59e0b' },
  { id: 'water', label: '💧 Water first', color: '#3b82f6' },
  { id: 'protein', label: '🍗 Protein first', color: '#10b981' },
  { id: 'stretch', label: '🧘 10min stretch', color: '#8b5cf6' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowHHMM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// ─── Reusable Components ─────────────────────────────────────────────────────

function Button({ onClick, children, color = 'var(--green)', variant = 'primary' }: {
  onClick: () => void; children: React.ReactNode; color?: string; variant?: 'primary'|'secondary'|'ghost'
}) {
  const styles = {
    primary: { background: color, border: `1px solid ${color}`, color: '#000' },
    secondary: { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' },
    ghost: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--dim)' },
  }
  return (
    <button
      onClick={onClick}
      style={{ padding: '0.5rem 0.9rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
        fontFamily: 'inherit', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
        transition: 'all 0.1s', ...styles[variant] }}
    >
      {children}
    </button>
  )
}

function ToggleButton({ active, onClick, label, color = '#10b981' }: {
  active: boolean; onClick: () => void; label: string; color?: string
}) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '0.4rem 0.7rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
        fontFamily: 'inherit', cursor: 'pointer', border: `2px solid ${active ? color : 'var(--border)'}`,
        background: active ? `${color}20` : 'transparent', transition: 'all 0.1s' }}
    >
      {active ? '✅ ' : '⬜ '}{label}
    </button>
  )
}

function ScaleSlider({ value, onChange, color = '#ec4899', label }: {
  value: number; onChange: (v: number) => void; color?: string; label?: string
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      {label && <div style={{ fontSize: '0.65rem', color: 'var(--dim)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>}
      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{ width: '1.8rem', height: '1.8rem', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer', border: `2px solid ${n <= value ? color : 'var(--border)'}`,
              background: n <= value ? color : 'transparent', color: n <= value ? '#000' : 'var(--muted)',
              transition: 'all 0.08s' }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function GoalChips({ selected, onChange }: { selected: Goal[]; onChange: (g: Goal[]) => void }) {
  function toggle(g: Goal) {
    onChange(selected.includes(g) ? selected.filter(x => x !== g) : [...selected, g])
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.8rem' }}>
      {(Object.entries(GOAL_META) as [Goal, typeof GOAL_META[Goal]][]).map(([key, meta]) => (
        <button
          key={key}
          onClick={() => toggle(key)}
          style={{ padding: '0.25rem 0.6rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 600,
            fontFamily: 'inherit', cursor: 'pointer', border: `2px solid ${selected.includes(key) ? meta.color : 'var(--border)'}`,
            background: selected.includes(key) ? meta.accent : 'transparent', color: selected.includes(key) ? meta.color : 'var(--muted)',
            transition: 'all 0.08s', textAlign: 'center' }}
        >
          {meta.label}
        </button>
      ))}
    </div>
  )
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', zIndex: 100 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ padding: '0.5rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
          background: t.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${t.ok ? 'var(--green)' : 'var(--red)'}`,
          color: t.ok ? 'var(--green)' : '#ef4444', fontFamily: 'inherit' }}>
          {t.ok ? '✓ ' : '✗ '}{t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Home Screen (Main Dashboard) ─────────────────────────────────────────────

function HomeScreen({ onSelect, onQuickLog, onSnapshot, onDailyCheck }: {
  onSelect: (m: Mode) => void
  onQuickLog: () => void
  onSnapshot: () => void
  onDailyCheck: () => void
}) {
  const [time, setTime] = useState(nowHHMM())

  useEffect(() => {
    const id = setInterval(() => setTime(nowHHMM()), 10000)
    return () => clearInterval(id)
  }, [])

  // Read recent data for context (would connect to API in real app)
  // For now, use static mock data
  const mockData = {
    morningDone: false,
    weightLossHabits: [true, false, false, false], // water, 20%, salt, protein
    patternRush: 3,
    patternYouTube: 3,
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }} className="animate-fade-up">
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(3rem, 15vw, 8rem)',
          letterSpacing: '0.05em', color: 'var(--bright)', lineHeight: 1 }}>
          {time}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.2rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Quick Status Indicators */}
      <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--surface)', borderRadius: '6px',
        border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>
          Today's Status
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
          <div>
            <div style={{ fontSize: '0.58rem', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Morning</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: mockData.morningDone ? 'var(--green)' : 'var(--muted)' }}>
              {mockData.morningDone ? '✅ Done' : '⏳ Pending'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Weight Loss</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--amber)' }}>
              {mockData.weightLossHabits.filter(Boolean).length}/4
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>End-of-Day Rush</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: mockData.patternRush >= 4 ? 'var(--green)' : 'var(--amber)' }}>
              {mockData.patternRush}/5
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>YouTube</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: mockData.patternYouTube >= 4 ? 'var(--green)' : 'var(--amber)' }}>
              {mockData.patternYouTube}/5
            </div>
          </div>
        </div>
      </div>

      {/* Priority Check */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>
          Today's Priorities
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
          {PRIORITY_ITEMS.map(item => (
            <div key={item.id} onClick={() => {}} style={{ padding: '0.5rem 0.7rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', border: `2px solid ${item.color}`, background: 'rgba(255,255,255,0.05)' }}>
              <span style={{ marginRight: '0.3rem' }}>{item.color === '#f59e0b' ? (mockData.morningDone ? '✅' : '⏳') : '⬜'}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px', margin: '0 auto' }}>
        <button
          onClick={onDailyCheck}
          style={{ padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: '4px solid var(--amber)', color: 'var(--bright)', fontFamily: 'inherit',
            fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', textAlign: 'left', borderRadius: '4px', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
        >
          <div>
            <div>DAILY CHECK</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--dim)', fontWeight: 400, marginTop: '0.2rem' }}>
              Morning, weight loss, stretch, patterns (60 seconds)
            </div>
          </div>
          <span style={{ color: 'var(--muted)' }}>→</span>
        </button>

        <button
          onClick={onQuickLog}
          style={{ padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: '4px solid var(--green)', color: 'var(--bright)', fontFamily: 'inherit',
            fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', textAlign: 'left', borderRadius: '4px', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
        >
          <div>
            <div>QUICK LOG</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--dim)', fontWeight: 400, marginTop: '0.2rem' }}>
              Session, domain, summary (30 seconds)
            </div>
          </div>
          <span style={{ color: 'var(--muted)' }}>→</span>
        </button>

        <button
          onClick={onSnapshot}
          style={{ padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)',
            borderLeft: '4px solid #06b6d4', color: 'var(--bright)', fontFamily: 'inherit',
            fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            cursor: 'pointer', textAlign: 'left', borderRadius: '4px', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,182,212,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
        >
          <div>
            <div>LEARNING SNAPSHOT</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--dim)', fontWeight: 400, marginTop: '0.2rem' }}>
              Recall, verify, insight (1 min)
            </div>
          </div>
          <span style={{ color: 'var(--muted)' }}>→</span>
        </button>
      </div>

      <div style={{ marginTop: '3rem', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
        📝 LOGGING TO ~/growth_mind/raw/
      </div>
    </div>
  )
}

// ─── Quick Log Form (3-click max) ─────────────────────────────────────────────

function QuickLogForm({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) {
  const [domain, setDomain] = useState<Goal[]>([])
  const [summary, setSummary] = useState('')
  const [patternRush, setPatternRush] = useState(3)
  const [patternYouTube, setPatternYouTube] = useState(3)
  const [pomodoroBlock, setPomodoroBlock] = useState(false)
  const [pomodoroRhythm, setPomodoroRhythm] = useState(false)
  const [hasInsight, setHasInsight] = useState(false)
  const [insight, setInsight] = useState('')

  const handleSubmit = () => {
    onSave({
      date: todayISO(),
      domain,
      summary,
      patternRush,
      patternYouTube,
      pomodoroBlock,
      pomodoroRhythm,
      insight: hasInsight ? insight : null,
      timestamp: nowHHMM(),
    })
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '500px', margin: '0 auto' }} className="animate-fade-up">
      <div style={{ fontSize: '0.7rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>
        Quick Log - {todayISO()}
      </div>

      {/* Step 1: Domain (1 click) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Domain(s)
        </div>
        <GoalChips selected={domain} onChange={setDomain} />
      </div>

      {/* Step 2: Summary (1 click) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          What happened (1 sentence)
        </div>
        <input
          type="text"
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="e.g. Music chord progression practice..."
          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--border)' }}
        />
      </div>

      {/* Step 3: Optional extras (quick toggles) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div>
          <ScaleSlider value={patternRush} onChange={setPatternRush} label="End-of-Day Rush" color="#ec4899" />
        </div>
        <div>
          <ScaleSlider value={patternYouTube} onChange={setPatternYouTube} label="YouTube Distortion" color="#f59e0b" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <ToggleButton active={pomodoroBlock} onClick={() => setPomodoroBlock(!pomodoroBlock)} label="60-90 block" />
        <ToggleButton active={pomodoroRhythm} onClick={() => setPomodoroRhythm(!pomodoroRhythm)} label="25+5 rhythm" />
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => setHasInsight(!hasInsight)}
          style={{ fontSize: '0.7rem', color: 'var(--dim)', background: 'none', border: 'none',
            cursor: 'pointer', padding: '0', marginBottom: '1.5rem' }}
        >
          {hasInsight ? '▼ Add insight (optional)' : '▲ Add insight (optional)'}
        </button>
      </div>

      {hasInsight && (
        <div style={{ marginBottom: '1.5rem' }} className="animate-fade-up">
          <textarea
            value={insight}
            onChange={e => setInsight(e.target.value)}
            placeholder="Key insight for future-you..."
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--border)',
              minHeight: '80px', resize: 'vertical' }}
          />
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '2rem' }}>
        <Button onClick={onCancel} variant="secondary">CANCEL</Button>
        <Button onClick={handleSubmit} variant="primary">✓ LOG IT</Button>
      </div>
    </div>
  )
}

// ─── Daily Check Form (2 clicks) ──────────────────────────────────────────────

function DailyCheckForm({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) {
  const [morningDone, setMorningDone] = useState(false)
  const [waterFirst, setWaterFirst] = useState(false)
  const [left20, setLeft20] = useState(false)
  const [askedSalt, setAskedSalt] = useState(false)
  const [proteinFirst, setProteinFirst] = useState(false)
  const [stretching, setStretching] = useState(false)
  const [patternRush, setPatternRush] = useState(3)
  const [patternYouTube, setPatternYouTube] = useState(3)
  const [reflection, setReflection] = useState('')

  const handleSubmit = () => {
    onSave({ date: todayISO(), morningDone, weightLossHabits: {
      waterFirst, left20, askedSalt, proteinFirst
    }, stretching, patternRush, patternYouTube, reflection })
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '500px', margin: '0 auto' }} className="animate-fade-up">
      <div style={{ fontSize: '0.7rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>
        Daily Check - {todayISO()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            Morning (before 9 AM)
          </div>
          <ToggleButton active={morningDone} onClick={() => setMorningDone(!morningDone)} label="Completed" color="#f59e0b" />
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            Stretching
          </div>
          <ToggleButton active={stretching} onClick={() => setStretching(!stretching)} label="10-15 min" color="#8b5cf6" />
        </div>
      </div>

      <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
        Weight Loss Habits
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <ToggleButton active={waterFirst} onClick={() => setWaterFirst(!waterFirst)} label="💧 Water first" color="#3b82f6" />
        <ToggleButton active={left20} onClick={() => setLeft20(!left20)} label="🍽️ 20% left" color="#10b981" />
        <ToggleButton active={askedSalt} onClick={() => setAskedSalt(!askedSalt)} label="🧂 Half salt" color="#f59e0b" />
        <ToggleButton active={proteinFirst} onClick={() => setProteinFirst(!proteinFirst)} label="🍗 Protein first" color="#ec4899" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <ScaleSlider value={patternRush} onChange={setPatternRush} label="End-of-Day Rush" color="#ec4899" />
        <ScaleSlider value={patternYouTube} onChange={setPatternYouTube} label="YouTube Distortion" color="#f59e0b" />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Quick reflection (1 sentence)
        </div>
        <input
          type="text"
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="Today's key insight..."
          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--border)' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '2rem' }}>
        <Button onClick={onCancel} variant="secondary">CANCEL</Button>
        <Button onClick={handleSubmit} variant="primary">✓ SAVE</Button>
      </div>
    </div>
  )
}

// ─── Learning Snapshot Form (5 clicks max) ────────────────────────────────────

function SnapshotForm({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) {
  const [topic, setTopic] = useState('')
  const [domain, setDomain] = useState<Goal[]>([])
  const [recall, setRecall] = useState('')
  const [insight, setInsight] = useState('')
  const [challenge, setChallenge] = useState('')

  const handleSubmit = () => {
    onSave({ date: todayISO(), topic, domain, recall, insight, challenge })
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '500px', margin: '0 auto' }} className="animate-fade-up">
      <div style={{ fontSize: '0.7rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem' }}>
        Learning Snapshot - {todayISO()}
      </div>

      {/* Step 1: Topic (1 click) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Topic / subject
        </div>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. UDX Constrained Optimizer Graph Representation"
          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--border)' }}
        />
      </div>

      {/* Step 2: Domain (1 click) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Domain
        </div>
        <GoalChips selected={domain} onChange={setDomain} />
      </div>

      {/* Step 3: Recall (1 click) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Recall attempt (what you tried to remember)
        </div>
        <textarea
          value={recall}
          onChange={e => setRecall(e.target.value)}
          placeholder="Write everything you can recall without looking..."
          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--border)',
            minHeight: '80px', resize: 'vertical' }}
        />
      </div>

      {/* Step 4: Insight (1 click) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Insight (what clicked)
        </div>
        <textarea
          value={insight}
          onChange={e => setInsight(e.target.value)}
          placeholder="What did you learn? A new connection..."
          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--border)',
            minHeight: '60px', resize: 'vertical' }}
        />
      </div>

      {/* Step 5: Challenge (1 click) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Micro-challenge (next action)
        </div>
        <input
          type="text"
          value={challenge}
          onChange={e => setChallenge(e.target.value)}
          placeholder="e.g. Write pseudo-code, explain to someone..."
          style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--border)' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '2rem' }}>
        <Button onClick={onCancel} variant="secondary">CANCEL</Button>
        <Button onClick={handleSubmit} variant="primary">✓ SAVE SNAPSHOT</Button>
      </div>
    </div>
  )
}

// ─── App Component ────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<Mode>('home')
  const [toasts, setToasts] = useState<Toast[]>([])

  function addToast(message: string, ok: boolean) {
    const id = Date.now()
    setToasts(t => [...t, { id, message, ok }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  const handleSave = (data: any) => {
    // In real app, would POST to /api/quick-log, etc.
    // For now, just toast and return to home
    addToast('Saved to ~/growth_mind/raw/', true)
    setMode('home')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#eee', fontFamily: 'system-ui, sans-serif', padding: '0.5rem' }}>
      <style>{`
        .animate-fade-up { animation: fadeUp 0.3s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        :root { --green: #10b981; --amber: #f59e0b; --border: #333; --surface: #1a1a1a; --dim: #666; --text: #eee; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', paddingBottom: '1rem' }}>
        <button
          onClick={() => setMode('home')}
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '1.2rem', letterSpacing: '0.15em',
            color: mode === 'home' ? 'var(--amber)' : 'var(--text)', background: 'none', border: 'none',
            cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
        >
          GROWTH LOGGER
        </button>
        {mode !== 'home' && (
          <div style={{ fontSize: '0.7rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.3rem' }}>
            {mode === 'quick-log' && 'QUICK LOG'}
            {mode === 'snapshot' && 'LEARNING SNAPSHOT'}
            {mode === 'daily-check' && 'DAILY CHECK'}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '600px', margin: '0 auto' }}>
        {mode === 'home' && (
          <HomeScreen
            onSelect={setMode}
            onQuickLog={() => setMode('quick-log')}
            onSnapshot={() => setMode('snapshot')}
            onDailyCheck={() => setMode('daily-check')}
          />
        )}
        {mode === 'quick-log' && <QuickLogForm onSave={handleSave} onCancel={() => setMode('home')} />}
        {mode === 'snapshot' && <SnapshotForm onSave={handleSave} onCancel={() => setMode('home')} />}
        {mode === 'daily-check' && <DailyCheckForm onSave={handleSave} onCancel={() => setMode('home')} />}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
