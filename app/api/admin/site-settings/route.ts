import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, verifySessionToken } from "../../../../lib/adminAuth";
import { saveSiteSettings, type SaveSiteSettingsPayload } from "../../../../lib/sanityWrite";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as SaveSiteSettingsPayload;
    const updated = await saveSiteSettings(payload);

    // Every public page reads from site settings, so revalidate the whole site
    revalidatePath("/", "layout");
    revalidatePath("/about");
    revalidatePath("/contact");
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
