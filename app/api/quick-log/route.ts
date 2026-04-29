import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = process.env.LOG_OUTPUT_DIR || path.join(process.env.HOME || '/Users/nsubordin81', 'growth_mind', 'raw')

function pad(n: number) { return String(n).padStart(2, '0') }

function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function goalLabel(goal: string | string[]) {
  const map: Record<string, string> = {
    dev: 'DEV', music: 'MUSIC', fitness: 'FITNESS',
    art: 'ART/CG', learning: 'LEARNING', admin: 'ADMIN', personal: 'PERSONAL',
  }
  const goals = Array.isArray(goal) ? goal : [goal]
  return goals.map(g => map[g] || g.toUpperCase()).join(' + ')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      startTime,
      endTime,
      title,
      goal,
      what,
      weightLossProgress,
      morningPriority,
      stretching,
      patternProgress,
      pomodoroBlock,
      pomodoroRhythm,
      keyInsight,
    } = body

    const now = new Date()
    const dateStr = formatDate(now)
    const start = startTime || formatTime(now)
    const end = endTime || ''

    const timeRange = end ? `${start} - ${end}` : start

    const entry = `
## ${dateStr} ${timeRange} | ${goalLabel(goal)} — ${title}

**What:** ${what}

**Pattern mitigation status:**
- 🟢 End-of-Day Rush: ${patternProgress?.endOfDayRush || 3}/5 (1=full, 5=none)
- 🟢 YouTube Distortion: ${patternProgress?.youTubeDistortion || 3}/5 (1=full, 5=none)

**Pomodoro adherence:**
- 🟢 60-90 min focus block: ${pomodoroBlock ? '✅' : '❌'}
- 🟢 25+5 rhythm: ${pomodoroRhythm ? '✅' : '❌'}

**Today's priorities check:**
- 💧 Water first: ${weightLossProgress?.waterFirst ? '✅' : '❌'}
- 🍽️ Left 20% on plate: ${weightLossProgress?.left20Percent ? '✅' : '❌'}
- 🧂 Asked for half salt: ${weightLossProgress?.askedHalfSalt ? '✅' : '❌'}
- 🍗 Protein first: ${weightLossProgress?.proteinFirst ? '✅' : '❌'}
- ⏰ Morning goal before 9 AM: ${morningPriority ? '✅' : '❌'}
- 🧘 10-15 min stretching: ${stretching ? '✅' : '❌'}

**Key insight:** ${keyInsight}
---
`.trimStart()

    // Ensure output dir exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    const filename = `quick_log_${dateStr}.md`
    const filepath = path.join(OUTPUT_DIR, filename)

    // Append or create
    if (fs.existsSync(filepath)) {
      fs.appendFileSync(filepath, '\n' + entry)
    } else {
      const header = `# Quick Log: ${dateStr}\n\n`
      fs.writeFileSync(filepath, header + entry)
    }

    return NextResponse.json({ success: true, filepath, filename })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
