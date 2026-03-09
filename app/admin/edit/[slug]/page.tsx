import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { ADMIN_COOKIE, verifySessionToken } from '../../../../lib/adminAuth'
import { getProjectBySlugForAdmin } from '../../../../lib/queries'
import EditorClient from './EditorClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const { slug } = await params

  // Auth check
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token || !(await verifySessionToken(token))) {
    redirect(`/admin/edit?redirect=/admin/edit/${slug}`)
  }

  const project = await getProjectBySlugForAdmin(slug)
  if (!project) notFound()

  return <EditorClient initialProject={project} />
}
