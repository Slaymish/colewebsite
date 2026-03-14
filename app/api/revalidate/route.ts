import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { slug?: { current?: string }; _type?: string } = {};
  try {
    body = await req.json();
  } catch {
    // no body — revalidate everything
  }

  const slug = body?.slug?.current ?? null;

  // Always revalidate home page (project list)
  revalidatePath("/");

  if (slug) {
    revalidatePath(`/project/${slug}`);
  } else {
    // No slug provided (e.g. siteSettings change) — revalidate all project paths
    revalidatePath("/project/[slug]", "page");
  }

  return Response.json({ revalidated: true, slug });
}
