import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { ADMIN_COOKIE, verifySessionToken } from '../../../lib/adminAuth'
import { getAllProjectsForAdmin } from '../../../lib/queries'
import { urlFor } from '../../../lib/sanity'
import LoginForm from './LoginForm'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return false
  return verifySessionToken(token)
}

async function ProjectList() {
  const projects = await getAllProjectsForAdmin()

  if (!projects.length) {
    return (
      <div className="text-center py-16 text-neutral-400">
        <p>No projects yet. Create one in{' '}
          <Link href="/admin/cms" className="underline hover:text-neutral-600">Sanity Studio</Link>.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-neutral-100">
      {projects.map((project) => {
        const thumbUrl = project.cover_image
          ? urlFor(project.cover_image).width(120).height(80).auto('format').url()
          : null

        return (
          <li key={project._id}>
            <Link
              href={`/admin/edit/${project.slug.current}`}
              className="flex items-center gap-4 py-4 hover:bg-neutral-50 -mx-4 px-4 rounded-lg transition-colors group"
            >
              {/* Thumbnail */}
              <div className="shrink-0 w-20 h-14 rounded overflow-hidden bg-neutral-100">
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt=""
                    width={80}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
                    No image
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900 truncate group-hover:underline">
                    {project.title}
                  </span>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      project.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                {project.created_at && (
                  <p className="text-sm text-neutral-400 mt-0.5">
                    {new Date(project.created_at).toLocaleDateString('en-NZ', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                )}
                {project.tags && project.tags.length > 0 && (
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">
                    {project.tags.join(', ')}
                  </p>
                )}
              </div>

              <span className="text-neutral-300 group-hover:text-neutral-500 text-lg shrink-0">→</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default async function AdminEditPage() {
  const authed = await isAuthenticated()

  if (!authed) {
    return (
      <Suspense>
        <LoginForm />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Edit Projects</h1>
            <p className="text-sm text-neutral-500 mt-1">Select a project to edit its layout</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/cms"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Sanity Studio →
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Project list */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm px-4">
          <Suspense
            fallback={
              <div className="py-8 text-center text-neutral-400 text-sm">Loading projects…</div>
            }
          >
            <ProjectList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
