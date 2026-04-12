import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '../../../../lib/adminAuth'
import { getWriteClient } from '../../../../lib/sanityWrite'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const client = getWriteClient()
    const type = file.type.startsWith('video/') ? 'file' : 'image'
    const buffer = Buffer.from(await file.arrayBuffer())
    const asset = await client.assets.upload(type, buffer, {
      filename: file.name,
      contentType: file.type,
    })

    return NextResponse.json({
      _id: asset._id,
      _type: 'reference',
      _ref: asset._id,
      url: asset.url,
      metadata: asset.metadata,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
