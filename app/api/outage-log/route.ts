import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR =
  process.env.LOG_OUTPUT_DIR ||
  path.join(process.env.HOME || '/Users/nsubordin81', 'growth_mind', 'raw')

function pad(n: number) { return String(n).padStart(2, '0') }
function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      startDate,        // YYYY-MM-DD string
      endDate,          // YYYY-MM-DD string (may equal startDate for single day)
      outageType,       // 'Weekend' | 'Holiday' | 'Travel' | 'Illness' | 'Family' | 'Other'
      outageTypeCustom, // string, used when outageType === 'Other'
      what,             // what you did that relates to goals (may be nothing)
      mentalPractice,   // any mental rehearsal, passive learning, etc.
      microActivities,  // any 5-10 min bursts
      reflection,       // key insight or question
      howFelt,          // emotion about the outage
      goalsAffected,    // string[] of goal IDs
      expectedResumption, // YYYY-MM-DD when normal routine resumes
      agentContext,     // free text — extra context for LLM reasoning (why counts missed, etc.)
    } = body

    const now = new Date()
    const dateStr = startDate || formatDate(now)
    const resolvedType = outageType === 'Other' && outageTypeCustom
      ? outageTypeCustom
      : (outageType || 'Other')

    const dateRange = endDate && endDate !== startDate
      ? `${startDate} to ${endDate}`
      : dateStr

    const goalsBlock = goalsAffected && goalsAffected.length
      ? goalsAffected.map((g: string) => `#${g}`).join(' ')
      : '_none specified_'

    const resumptionLine = expectedResumption
      ? `\n**Expected resumption:** ${expectedResumption}`
      : ''

    const agentLine = agentContext
      ? `\n\n### Agent Context\n_For LLM reasoning — do not count missed sessions during this window against goal progress._\n${agentContext}`
      : `\n\n### Agent Context\n_For LLM reasoning — do not count missed sessions during this window against goal progress._`

    const entry = `## ${dateRange} | OUTAGE MODE
**Type:** ${resolvedType}
**Goals affected:** ${goalsBlock}${resumptionLine}

**What happened:** ${what || '_Nothing goal-related_'}

**Mental practice:** ${mentalPractice || '_None_'}

**Micro-activities:** ${microActivities || '_None_'}

**Reflection:** ${reflection || '_None_'}

**How I felt:** ${howFelt || '_Not recorded_'}
${agentLine}

---
`

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    // Use the start date for the filename; append if multiple outages in same day
    const filename = `outage_log_${dateStr}.md`
    const filepath = path.join(OUTPUT_DIR, filename)

    if (fs.existsSync(filepath)) {
      fs.appendFileSync(filepath, '\n' + entry)
    } else {
      const header = `# Outage Log: ${dateStr}\n\n`
      fs.writeFileSync(filepath, header + entry)
    }

    return NextResponse.json({ success: true, filepath, filename })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
