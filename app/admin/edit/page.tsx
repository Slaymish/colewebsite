import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ADMIN_COOKIE, verifySessionToken } from "../../../lib/adminAuth";
import { getAllProjectsForAdmin } from "../../../lib/queries";
import { urlFor } from "../../../lib/sanity";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

async function ProjectList() {
  const projects = await getAllProjectsForAdmin();

  if (!projects.length) {
    return (
      <div className="py-16 text-center text-neutral-400">
        <p>
          No projects yet. Create one in{" "}
          <Link href="/admin/cms" className="underline hover:text-neutral-600">
            Sanity Studio
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-neutral-100">
      {projects.map((project) => {
        const thumbUrl = project.cover_image
          ? urlFor(project.cover_image)
              .width(120)
              .height(80)
              .auto("format")
              .url()
          : null;

        return (
          <li key={project._id}>
            <Link
              href={`/admin/edit/${project.slug.current}`}
              className="-mx-2 flex items-center gap-4 rounded-xl px-2 py-4 transition-colors hover:bg-neutral-50"
            >
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt=""
                    width={80}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-300">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-neutral-900">
                    {project.title}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                      project.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                {project.created_at && (
                  <p className="mt-0.5 text-sm text-neutral-400">
                    {new Date(project.created_at).toLocaleDateString("en-NZ", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                )}
                {project.tags && project.tags.length > 0 && (
                  <p className="mt-0.5 truncate text-xs text-neutral-400">
                    {project.tags.join(", ")}
                  </p>
                )}
              </div>

              <span className="shrink-0 text-lg text-neutral-300">→</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function AdminEditPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return (
      <Suspense>
        <LoginForm />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Edit Projects
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Select a project to edit its layout
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-sm">
              <Link href="/admin/cms">Sanity Studio →</Link>
            </Button>
            <LogoutButton />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white px-4 shadow-sm">
          <Suspense
            fallback={
              <div className="py-8 text-center text-sm text-neutral-400">
                Loading projects…
              </div>
            }
          >
            <ProjectList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
