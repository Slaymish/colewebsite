import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, ADMIN_COOKIE, getCookieOptions } from '../../../../lib/adminAuth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Server configuration error: ADMIN_PASSWORD not set' },
        { status: 500 },
      )
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = await createSessionToken()
    const response = NextResponse.json({ ok: true })
    response.cookies.set(ADMIN_COOKIE, token, getCookieOptions())

    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
