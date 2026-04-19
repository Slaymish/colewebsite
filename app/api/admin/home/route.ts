import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, verifySessionToken } from "../../../../lib/adminAuth";
import { updateHomePageOrder, type HomePageItemUpdate } from "../../../../lib/sanityWrite";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { items?: HomePageItemUpdate[] };
    if (!Array.isArray(body.items)) {
      return NextResponse.json({ error: "items must be an array" }, { status: 400 });
    }

    // Minimal validation so malformed payloads don't silently succeed
    for (const item of body.items) {
      if (typeof item.id !== "string" || !item.id) {
        return NextResponse.json({ error: "each item requires an id" }, { status: 400 });
      }
      if (typeof item.isSelectedOnHome !== "boolean") {
        return NextResponse.json(
          { error: "each item requires a boolean isSelectedOnHome" },
          { status: 400 },
        );
      }
      if (typeof item.homeOrder !== "number") {
        return NextResponse.json(
          { error: "each item requires a numeric homeOrder" },
          { status: 400 },
        );
      }
    }

    await updateHomePageOrder(body.items);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
