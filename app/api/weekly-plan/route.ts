import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR =
  process.env.LOG_OUTPUT_DIR ||
  path.join(process.env.HOME || '/Users/nsubordin81', 'growth_mind', 'raw')

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// ISO week number + year
function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  )
  return { year: d.getUTCFullYear(), week }
}

function mondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - (day - 1))
  return d
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface GoalItem {
  goalId: string
  task: string
  time: string
  struggleTarget?: number
}

interface FocusArea {
  goalId: string
  status: string
}

interface StrugglePattern {
  name: string
  insight: string
}

interface ActionItem {
  deadline: string
  goalId: string
}

function renderGoalItem(g: GoalItem, prefix: string) {
      const time = g.time ? ` - ${g.time}` : ''
      return `- [ ] ${prefix}: ${g.goalId} - ${g.task}${time}`
    }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      weekDate,          // ISO string for any day in the target week (defaults to now)
      microGoals,        // GoalItem[3]
      learningGoals,     // GoalItem[2]
      focusGoal,         // GoalItem
      focusAreas,        // FocusArea[]
      strugglePatterns,  // StrugglePattern[]
      actionItems,       // ActionItem[]
      microStruggleTarget,    // number
      learningStruggleTarget, // number
      focusStruggleTarget,    // number
      notes,             // string
    } = body

    const base = weekDate ? new Date(weekDate) : new Date()
    const monday = mondayOfWeek(base)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const { year, week } = isoWeek(base)
    const weekLabel = `${year}-W${pad(week)}`
    const weekRange = `${formatDate(monday)} to ${formatDate(sunday)}`


    const microBlock = (microGoals as GoalItem[])
      .map((g, i) => renderGoalItem(g, `Micro-Goal ${i + 1}`))
      .join('\n')

    const learningBlock = (learningGoals as GoalItem[])
      .map((g, i) => renderGoalItem(g, `Learning Goal ${i + 1}`))
      .join('\n')

    const focusBlock = renderGoalItem(focusGoal as GoalItem, 'Focus Session')

    const focusAreaBlock = focusAreas && focusAreas.length
      ? (focusAreas as FocusArea[]).map(f => `- **${f.goalId}:** ${f.status}`).join('\n')
      : '- _No status entries_'

    const patternBlock = strugglePatterns && strugglePatterns.length
      ? (strugglePatterns as StrugglePattern[])
          .map(p => `- **${p.name}:** ${p.insight}`)
          .join('\n')
      : '- _No patterns noted_'

    const actionBlock = actionItems && actionItems.length
      ? (actionItems as ActionItem[])
          .map(a => `- [ ] ${a.deadline} - ${a.goalId}`)
          .join('\n')
      : '- [ ] _No action items_'

    const mTarget = microStruggleTarget ?? '2-3'
    const lTarget = learningStruggleTarget ?? '3-4'
    const fTarget = focusStruggleTarget ?? '4-5'

    const notesBlock = notes ? `\n## Notes\n${notes}\n` : ''

    const content = `# Weekly Plan: ${weekLabel}
**Week of:** ${weekRange}

## Your 3-2-1 Framework

### 3 Micro-Goals (10-20 min each, non-negotiable)
${microBlock}

### 2 Learning Goals (30-45 min combined, flexible)
${learningBlock}

### 1 Focus Goal (60-90 min, deep work session)
${focusBlock}

## Weekly Focus Areas

### Based on ${weekLabel} Status:
${focusAreaBlock}

### Recent Struggle Patterns (from your logs):
${patternBlock}

## Your Weekly Action Items
${actionBlock}

## Struggle Calibration
For each session, rate difficulty: 1 (easy) - 5 (overwhelming)
- Micro-Goals: [Target: ${mTarget}]
- Learning Goals: [Target: ${lTarget}]
- Focus Session: [Target: ${fTarget}]
${notesBlock}`

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    const filename = `weekly_plan_${weekLabel}.md`
    const filepath = path.join(OUTPUT_DIR, filename)
    fs.writeFileSync(filepath, content)   // overwrite — one plan per week

    return NextResponse.json({ success: true, filepath, filename, weekLabel })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
