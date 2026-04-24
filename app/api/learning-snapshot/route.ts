import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = process.env.LOG_OUTPUT_DIR || path.join(process.env.HOME || '/Users/nsubordin81', 'growth_mind', 'raw')

function pad(n: number) { return String(n).padStart(2, '0') }
function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
function formatTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function domainLabel(domain: string | string[]): string {
  if (Array.isArray(domain)) {
    return domain.length ? domain.join(' + ').toUpperCase() : 'GENERAL'
  }
  return (domain || 'general').toUpperCase()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      topic,
      domain,
      recallAttempt,
      actualKnowledge,
      confusions,
      insight,
      microChallenge,
      confidenceLevel,
      sources,
    } = body

    const now = new Date()
    const dateStr = formatDate(now)
    const timeStr = formatTime(now)

    const confBar = confidenceLevel
      ? `${'▓'.repeat(confidenceLevel)}${'░'.repeat(5 - confidenceLevel)} ${confidenceLevel}/5`
      : 'Not rated'

    const sourceBlock = sources && sources.length
      ? `\n**Sources / references:** ${sources.join(', ')}`
      : ''

    const entry = `## ${dateStr} ${timeStr} | Learning Snapshot — ${topic}

**Domain:** ${domainLabel(domain)}
**Confidence after recall:** ${confBar}

**What I was learning:** ${topic}

**My recall attempt:**
${recallAttempt}

**What I actually knew / verified:**
${actualKnowledge || '_Not recorded_'}

**My confusions:**
${confusions || '_None noted_'}

**My insight:**
${insight || '_None noted_'}

**My micro-challenge:**
${microChallenge || '_None set_'}
${sourceBlock}
---
`

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    const filename = `learning_snapshot_${dateStr}.md`
    const filepath = path.join(OUTPUT_DIR, filename)

    if (fs.existsSync(filepath)) {
      fs.appendFileSync(filepath, '\n' + entry)
    } else {
      const header = `# Learning Snapshots: ${dateStr}\n\n`
      fs.writeFileSync(filepath, header + entry)
    }

    return NextResponse.json({ success: true, filepath, filename })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
