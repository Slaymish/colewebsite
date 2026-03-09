import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '../../../../lib/adminAuth'
import { getClient, isSanityConfigured } from '../../../../lib/sanity'
import type { Project } from '../../../../types'

const PROJECT_FULL_FIELDS = `
  _id,
  title,
  slug,
  status,
  created_at,
  tags,
  meta_description,
  cover_image { ..., asset->{ _id, url, metadata { dimensions, lqip } } },
  og_image { ..., asset->{ _id, url, metadata { dimensions } } },
  sections[] {
    ...,
    _type == 'imageSection' => {
      image { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    },
    _type == 'gallerySection' => {
      images[] { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    },
    _type == 'splitSection' => {
      image { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    },
    _type == 'heroSection' => {
      backgroundImage { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
    },
    _type == 'videoSection' => {
      poster { ..., asset->{ _id, url, metadata { dimensions } } }
    }
  }
`

export async function GET(request: NextRequest) {
  // Verify auth
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isSanityConfigured()) {
    return NextResponse.json({ error: 'Sanity not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  try {
    if (slug) {
      // Fetch single project (including drafts) for the editor
      const results = await getClient().fetch<Project[]>(
        `*[_type == "project" && slug.current == $slug] | order(_updatedAt desc) [0..0] { ${PROJECT_FULL_FIELDS} }`,
        { slug },
      )
      const project = results[0] ?? null
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      return NextResponse.json(project)
    } else {
      // Fetch all projects (both draft and published)
      const projects = await getClient().fetch<Project[]>(
        `*[_type == "project"] | order(created_at desc) {
          _id, title, slug, status, created_at, tags,
          cover_image { ..., asset->{ _id, url, metadata { dimensions, lqip } } }
        }`,
      )
      return NextResponse.json(projects)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fetch failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
