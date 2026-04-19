import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "../../../../lib/adminAuth";
import { getSiteSettings } from "../../../../lib/queries";
import SiteSettingsEditor from "../_components/SiteSettingsEditor";

export const dynamic = "force-dynamic";

export default async function AdminAboutEditPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    redirect("/admin/edit?redirect=/admin/edit/about");
  }

  const settings = await getSiteSettings();
  return <SiteSettingsEditor initialSettings={settings} mode="about" />;
}
