import { createClient } from 'next-sanity'
import type { Section } from '../types'

export function getWriteClient() {
  const token = process.env.SANITY_API_TOKEN
  if (!token) {
    throw new Error('SANITY_API_TOKEN is not set. Add it to your .env.local file.')
  }
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01',
    useCdn: false,
    token,
  })
}

export interface SaveProjectPayload {
  projectId: string
  sections: Section[]
  status?: 'draft' | 'published'
  title?: string
  meta_description?: string
  tags?: string[]
}

export async function saveProject(payload: SaveProjectPayload): Promise<void> {
  const client = getWriteClient()

  const patch: Record<string, unknown> = {
    sections: payload.sections,
  }

  if (payload.status !== undefined) patch.status = payload.status
  if (payload.title !== undefined) patch.title = payload.title
  if (payload.meta_description !== undefined) patch.meta_description = payload.meta_description
  if (payload.tags !== undefined) patch.tags = payload.tags

  await client.patch(payload.projectId).set(patch).commit()
}
