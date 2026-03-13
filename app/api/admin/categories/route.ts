import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, verifySessionToken } from "../../../../lib/adminAuth";
import { saveSiteCategories } from "../../../../lib/sanityWrite";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      settingsId?: string;
      categories?: string[];
    };

    await saveSiteCategories({
      settingsId: payload.settingsId,
      categories: payload.categories ?? [],
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
