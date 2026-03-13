import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "../../../../lib/adminAuth";
import {
  getProjectBySlugForAdmin,
  getSiteSettings,
} from "../../../../lib/queries";
import EditorClient from "./EditorClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect(`/admin/edit?redirect=/admin/edit/${slug}`);
  }

  const [project, settings] = await Promise.all([
    getProjectBySlugForAdmin(slug),
    getSiteSettings(),
  ]);

  if (!project) notFound();

  return (
    <EditorClient
      initialProject={project}
      availableCategories={settings?.categories ?? []}
    />
  );
}
