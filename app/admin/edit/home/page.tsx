import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "../../../../lib/adminAuth";
import { getAllProjectsForAdmin } from "../../../../lib/queries";
import HomeEditorClient from "./HomeEditorClient";

export const dynamic = "force-dynamic";

export default async function AdminHomeEditPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/edit?redirect=/admin/edit/home");
  }

  const projects = await getAllProjectsForAdmin();

  return <HomeEditorClient initialProjects={projects} />;
}
