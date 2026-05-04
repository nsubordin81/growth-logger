import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = process.env.LOG_OUTPUT_DIR || path.join(process.env.HOME || '/Users/nsubordin81', 'growth_mind', 'raw')

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      date,
      morningDone,
      waterDone,
      proteinDone,
      stretchDone,
      pomodoroDone,
      patternRush,
      patternYouTube,
      reflection,
      sleep = {},
    } = body

    const now = new Date()
    const todayStr = formatDate(now)

    const status = [
      morningDone && '⏰ Morning',
      waterDone && '💧 Water',
      proteinDone && '🍗 Protein',
      stretchDone && '🧘 Stretch',
      pomodoroDone && '⏰ Pomodoro',
    ].filter(Boolean).join(' | ') || 'No priorities updated'

    const sleepInfo = sleep.good 
      ? `${sleep.hours ? `${sleep.hours} hrs` : ' hrs'} sleep, ${sleep.rem ? `${sleep.rem} REM` : 'REM'}`
      : 'Poor sleep'

    const entry = `## ${todayStr} | Daily Status

**Priorities completed:** ${status}

**Sleep Quality:** ${sleepInfo}

**Pattern Metrics (now):**
- End-of-day Rush: ${patternRush}/5
- YouTube Distortion: ${patternYouTube}/5

**Reflection:**
${reflection || '_None noted_'}

---

`

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    const filename = `daily_status_${todayStr}.md`
    const filepath = path.join(OUTPUT_DIR, filename)

    if (fs.existsSync(filepath)) {
      fs.appendFileSync(filepath, entry)
    } else {
      const header = `# Daily Status: ${todayStr}\n\n`
      fs.writeFileSync(filepath, header + entry)
    }

    return NextResponse.json({ success: true, filepath, filename })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
