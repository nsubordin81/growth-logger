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
      whyMatters,
      howFelt,
      struggleLevel,       // 1-5
      struggleType,        // 'cognitive' | 'physical' | 'emotional' | 'none'
      lowEffortReward,     // boolean
      lowEffortRewardNote,
      keyInsight,
      actionItems,         // string[]
      tags,                // string[]
    } = body

    const now = new Date()
    const dateStr = formatDate(now)
    const start = startTime || formatTime(now)
    const end = endTime || ''

    const timeRange = end ? `${start} - ${end}` : start

    const struggleBar = struggleLevel
      ? `${'█'.repeat(struggleLevel)}${'░'.repeat(5 - struggleLevel)} ${struggleLevel}/5`
      : 'Not rated'

    const actionBlock = actionItems && actionItems.length
      ? `\n**Action Items:**\n${actionItems.map((a: string) => `- [ ] ${a}`).join('\n')}`
      : ''

    const tagBlock = tags && tags.length
      ? `\n**Tags:** ${tags.map((t: string) => `#${t}`).join(' ')}`
      : ''

    const entry = `
## ${dateStr} ${timeRange} | ${goalLabel(goal)} — ${title}

**What:** ${what}

**Why it matters:** ${whyMatters}

**How I felt:** ${howFelt}

**Struggle level:** ${struggleBar}
**Struggle type:** ${struggleType || 'n/a'}

**Low-effort reward?** ${lowEffortReward ? `Yes${lowEffortRewardNote ? ` — ${lowEffortRewardNote}` : ''}` : 'No'}

**Key insight for future-me:** ${keyInsight}
${actionBlock}
${tagBlock}
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
