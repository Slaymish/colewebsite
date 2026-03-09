import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '../../../../lib/adminAuth'
import { saveProject, type SaveProjectPayload } from '../../../../lib/sanityWrite'

export async function POST(request: NextRequest) {
  // Verify auth
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload: SaveProjectPayload = await request.json()

    if (!payload.projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    await saveProject(payload)

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
