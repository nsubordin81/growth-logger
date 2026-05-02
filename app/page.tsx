'use client'
import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'home' | 'quick-log' | 'snapshot' | 'daily-check'
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

// ─── API Helper ───────────────────────────────────────────────────────────────

async function saveToAPI(endpoint: string, data: any): Promise<{success: boolean, error?: string}> {
  try {
    const res = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'API error')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─── Home Screen (Main Dashboard) ────────────────────────────────────────────

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
            <div style={{ fontSize: '0.58rem', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>End-of-day Rush</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: mockData.patternRush <= 2 ? 'var(--green)' : 'var(--amber)' }}>
              {mockData.patternRush}/5 {mockData.patternRush <= 2 ? '✅ Calm' : '⚠️ Rising'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>YouTube Distortion</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: mockData.patternYouTube <= 2 ? 'var(--green)' : 'var(--amber)' }}>
              {mockData.patternYouTube}/5 {mockData.patternYouTube <= 2 ? '✅ Focused' : '⚠️ Distracting'}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Check - Status Only (not a form) */}
      <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--surface)', borderRadius: '6px',
        border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>
          Daily Progress (Update throughout day)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          {PRIORITY_ITEMS.map(item => (
            <ToggleButton 
              key={item.id}
              active={item.id === 'water' ? true : false} // Mock data
              onClick={() => {}} 
              label={item.label}
              color={item.color}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '320px', margin: '0 auto' }}>
        <Button onClick={onQuickLog} variant="primary">
          + LOG SESSION
        </Button>
        <Button onClick={onSnapshot} variant="secondary">
          📚 LEARNING SNAPSHOT
        </Button>
        <Button onClick={onDailyCheck} variant="ghost">
          📋 DAILY STATUS
        </Button>
      </div>
    </div>
  )
}

// ─── Quick Log Form (3 clicks max) ────────────────────────────────────────────

function QuickLogForm({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) {
  const [domain, setDomain] = useState<Goal[]>([])
  const [summary, setSummary] = useState('')
  const [patternRush, setPatternRush] = useState(3)
  const [patternYouTube, setPatternYouTube] = useState(3)
  const [pomodoroBlock, setPomodoroBlock] = useState(false)
  const [pomodoroRhythm, setPomodoroRhythm] = useState(false)
  const [insight, setInsight] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSaving(true)
    setSaveError(null)
    
    const data = {
      startTime: todayISO(),
      endTime: '',
      title: summary.split('\n')[0] || 'Session',
      goal: domain,
      what: summary,
      weightLossProgress: { waterFirst: true, left20Percent: false, askedHalfSalt: false, proteinFirst: false },
      morningPriority: false,
      stretching: false,
      patternProgress: { endOfDayRush: patternRush, youTubeDistortion: patternYouTube },
      pomodoroBlock,
      pomodoroRhythm,
      keyInsight: insight,
    }

    const result = await saveToAPI('quick-log', data)
    setIsSaving(false)
    
    if (result.success) {
      onSave(data)
    } else {
      setSaveError(result.error || 'Failed to save')
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', textAlign: 'center' }}>
        Quick Log - {todayISO()}
      </div>

      {/* Step 1: Select domain */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Domain(s) 🎯
        </div>
        <GoalChips selected={domain} onChange={setDomain} />
      </div>

      {/* Step 2: Summary */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          What happened? (1-2 sentences) ✍️
        </label>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="e.g., 60 min focused guitar practice - worked on chord transitions"
          rows={3}
          style={{ width: '100%', padding: '0.7rem', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: 1.5 }}
          autoFocus
        />
      </div>

      {/* Step 3: Optional extras */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '6px' }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
          Optional: Pattern & Focus
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <ScaleSlider value={patternRush} onChange={setPatternRush} color="#10b981" label="End-of-day rush" />
          </div>
          <div>
            <ScaleSlider value={patternYouTube} onChange={setPatternYouTube} color="#ec4899" label="YouTube distraction" />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <ToggleButton active={pomodoroBlock} onClick={() => setPomodoroBlock(!pomodoroBlock)} label="60-90min block" />
          <ToggleButton active={pomodoroRhythm} onClick={() => setPomodoroRhythm(!pomodoroRhythm)} label="25+5 rhythm" />
        </div>
        
        <div style={{ marginBottom: '0.8rem' }}>
          <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
            Any insight? 💡
          </label>
          <input
            value={insight}
            onChange={e => setInsight(e.target.value)}
            placeholder="What clicked today?"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* Error message */}
      {saveError && (
        <div style={{ marginBottom: '1rem', padding: '0.8rem', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
          {saveError}
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <Button onClick={onCancel} variant="ghost">CANCEL</Button>
        <Button 
          onClick={handleSubmit} 
          variant="primary" 
          color={domain.length > 0 && summary ? 'var(--green)' : '#6b7280'}>
          {isSaving ? 'SAVING...' : '✓ LOG IT'}
        </Button>
      </div>

      {/* Progress count */}
      <div style={{ marginTop: '2rem', fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Clicks so far: <strong>2-3</strong> (Domain → Summary → [Optional])
      </div>
    </div>
  )
}

// ─── Daily Check Form (2 clicks - status update) ─────────────────────────────

function DailyCheckForm({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) {
  const [morningDone, setMorningDone] = useState(false)
  const [waterDone, setWaterDone] = useState(false)
  const [proteinDone, setProteinDone] = useState(false)
  const [stretchDone, setStretchDone] = useState(false)
  const [pomodoroDone, setPomodoroDone] = useState(false)
  const [patternRush, setPatternRush] = useState(3)
  const [patternYouTube, setPatternYouTube] = useState(3)
  const [reflection, setReflection] = useState('')
  const [sleepGood, setSleepGood] = useState(false)
  const [sleepHours, setSleepHours] = useState('')
  const [sleepRem, setSleepRem] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSaving(true)
    setSaveError(null)
    
    const data = {
      date: todayISO(),
      morningDone,
      waterDone,
      proteinDone,
      stretchDone,
      pomodoroDone,
      patternRush,
      patternYouTube,
      reflection,
      sleep: {
        good: sleepGood,
        hours: sleepHours || null,
        rem: sleepRem || null,
      },
    }

    // Note: This would connect to a daily-check API
    setIsSaving(false)
    onSave(data)
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', textAlign: 'center' }}>
        Daily Status - {todayISO()}
      </div>

      {/* Priority check-ins */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '6px' }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          Update as you go throughout the day ✅
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <ToggleButton active={morningDone} onClick={() => setMorningDone(!morningDone)} label="⏰ Morning goal (before 9 AM)" color="#f59e0b" />
          <ToggleButton active={waterDone} onClick={() => setWaterDone(!waterDone)} label="💧 Water first thing" color="#3b82f6" />
          <ToggleButton active={proteinDone} onClick={() => setProteinDone(!proteinDone)} label="🍗 Protein first" color="#10b981" />
          <ToggleButton active={stretchDone} onClick={() => setStretchDone(!stretchDone)} label="🧘 10-15 min stretch" color="#8b5cf6" />
          <ToggleButton active={pomodoroDone} onClick={() => setPomodoroDone(!pomodoroDone)} label="⏳ Completed Pomodoro session" color="#ec4899" />
        </div>
      </div>

      {/* Pattern sliders */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '6px' }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
          Pattern Metrics (1=worst, 5=best)
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <ScaleSlider value={patternRush} onChange={setPatternRush} color="#10b981" label="End-of-day rush" />
          </div>
          <div>
            <ScaleSlider value={patternYouTube} onChange={setPatternYouTube} color="#ec4899" label="YouTube distraction" />
          </div>
        </div>
      </div>

      {/* Sleep Quality */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '6px' }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
          Sleep Quality 🛌
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSleepGood(!sleepGood)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              background: sleepGood ? 'var(--green)' : 'var(--surface)',
              border: '1px solid var(--border)',
              color: sleepGood ? 'var(--surface)' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '0.75rem',
            }}
          >
            {sleepGood ? '✅ Good Sleep' : '❌ Poor Sleep'}
          </button>
          <input
            type="number"
            value={sleepHours}
            onChange={e => setSleepHours(e.target.value)}
            placeholder="hrs"
            style={{ width: '4rem', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.75rem' }}
          />
          <input
            type="number"
            value={sleepRem}
            onChange={e => setSleepRem(e.target.value)}
            placeholder="REM hrs"
            style={{ width: '5rem', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.75rem' }}
          />
        </div>
      </div>

      {/* Quick reflection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Quick reflection (1 sentence) 🧠
        </label>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="How did today compare to yesterday?"
          rows={3}
          style={{ width: '100%', padding: '0.7rem', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: 1.5 }}
        />
      </div>

      {/* Error */}
      {saveError && (
        <div style={{ marginBottom: '1rem', padding: '0.8rem', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
          {saveError}
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <Button onClick={onCancel} variant="ghost">CANCEL</Button>
        <Button 
          onClick={handleSubmit} 
          variant="primary"
        >
          {isSaving ? 'UPDATING...' : '✓ SAVE STATUS'}
        </Button>
      </div>

      {/* Progress count */}
      <div style={{ marginTop: '2rem', fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Clicks: <strong>1-2</strong> (Toggle status → Submit)
      </div>
    </div>
  )
}

// ─── Learning Snapshot Form (5 clicks max - merged with Quick Log) ───────────

function SnapshotForm({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) {
  const [topic, setTopic] = useState('')
  const [domain, setDomain] = useState<Goal[]>([])
  const [recall, setRecall] = useState('')
  const [insight, setInsight] = useState('')
  const [challenge, setChallenge] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSaving(true)
    setSaveError(null)
    
    const data = {
      topic,
      domain,
      recallAttempt: recall,
      actualKnowledge: '', // Would be collected from a verification step
      confusions: '',
      insight,
      microChallenge: challenge,
      confidenceLevel: 3,
      sources: [],
    }

    const result = await saveToAPI('learning-snapshot', data)
    setIsSaving(false)
    
    if (result.success) {
      onSave(data)
    } else {
      setSaveError(result.error || 'Failed to save')
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', textAlign: 'center' }}>
        Learning Snapshot - {todayISO()}
      </div>

      {/* Step 1: Topic */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          What were you learning? 📚
        </label>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g., Chord progressions in songwriting"
          style={{ width: '100%', padding: '0.7rem', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '1rem' }}
          autoFocus
        />
      </div>

      {/* Step 2: Domain */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Related domain(s)
        </div>
        <GoalChips selected={domain} onChange={setDomain} />
      </div>

      {/* Step 3: Recall */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          What did you try to recall? (Active recall attempt) 🧠
        </label>
        <textarea
          value={recall}
          onChange={e => setRecall(e.target.value)}
          placeholder="e.g., I tried to remember all the diatonic chords in C major..."
          rows={4}
          style={{ width: '100%', padding: '0.7rem', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: 1.5 }}
        />
      </div>

      {/* Step 4: Insight */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          What insight or learning clicked? 💡
        </label>
        <textarea
          value={insight}
          onChange={e => setInsight(e.target.value)}
          placeholder="e.g., I realized the vi-IV-I-V progression is just I-vi-IV-V with a different starting point..."
          rows={4}
          style={{ width: '100%', padding: '0.7rem', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: 1.5 }}
        />
      </div>

      {/* Step 5: Challenge */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Micro-challenge for next time? 🎯
        </label>
        <input
          value={challenge}
          onChange={e => setChallenge(e.target.value)}
          placeholder="e.g., Practice the progression in 3 different keys"
          style={{ width: '100%', padding: '0.7rem', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem' }}
        />
      </div>

      {/* Error */}
      {saveError && (
        <div style={{ marginBottom: '1rem', padding: '0.8rem', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '4px', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
          {saveError}
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <Button onClick={onCancel} variant="ghost">CANCEL</Button>
        <Button 
          onClick={handleSubmit} 
          variant="primary" 
          color={topic && domain.length > 0 ? 'var(--green)' : '#6b7280'}>
          {isSaving ? 'SAVING...' : '✓ SAVE SNAPSHOT'}
        </Button>
      </div>

      {/* Progress count */}
      <div style={{ marginTop: '2rem', fontSize: '0.6rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Clicks so far: <strong>5</strong> (Topic → Domain → Recall → Insight → Challenge)
      </div>
    </div>
  )
}

// ─── Main App Component ───────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<Mode>('home')
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, ok: boolean) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, ok }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const handleSave = (data: any) => {
    addToast('Saved to ~/growth_mind/raw/', true)
    setMode('home')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111', color: '#eee', fontFamily: 'system-ui, sans-serif', padding: '0.5rem' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-up { animation: fadeUp 0.3s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        :root { --green: #10b981; --amber: #f59e0b; --border: #333; --surface: #1a1a1a; --dim: #666; --text: #eee; --bright: #fff; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', paddingBottom: '1rem' }}>
        <button
          onClick={() => setMode('home')}
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '1.2rem', letterSpacing: '0.15em',
            color: mode === 'home' ? 'var(--amber)' : 'var(--text)', background: 'none', border: 'none',
            cursor: 'pointer' }}
        >
          GROWTH LOGGER
        </button>
        <div style={{ fontSize: '0.55rem', color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.2rem' }}>
          {mode !== 'home' && <button onClick={() => setMode('home')} style={{ color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.55rem' }}>← Back</button>}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        {mode === 'home' && <HomeScreen onSelect={setMode} onQuickLog={() => setMode('quick-log')} onSnapshot={() => setMode('snapshot')} onDailyCheck={() => setMode('daily-check')} />}
        {mode === 'quick-log' && <QuickLogForm onSave={handleSave} onCancel={() => setMode('home')} />}
        {mode === 'snapshot' && <SnapshotForm onSave={handleSave} onCancel={() => setMode('home')} />}
        {mode === 'daily-check' && <DailyCheckForm onSave={handleSave} onCancel={() => setMode('home')} />}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
