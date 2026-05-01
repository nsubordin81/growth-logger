export async function postQuickLog(data: any) {
  try {
    const res = await fetch('/api/quick-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Quick log save failed')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function postSnapshot(data: any) {
  try {
    const res = await fetch('/api/learning-snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Snapshot save failed')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
