import { cookies } from "next/headers";
import { Suspense } from "react";
import { ADMIN_COOKIE, verifySessionToken } from "../../../lib/adminAuth";
import { getAllProjectsForAdmin } from "../../../lib/queries";
import LoginForm from "./LoginForm";
import LogoutButton from "./LogoutButton";
import ProjectListClient from "./ProjectListClient";

export const dynamic = "force-dynamic";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

async function ProjectList() {
  const projects = await getAllProjectsForAdmin();
  return <ProjectListClient initialProjects={projects} />;
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
            <h1 className="text-2xl font-semibold text-neutral-900">Edit Projects</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Select a project to edit its layout, or create a new one.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white px-2 shadow-sm">
          <Suspense
            fallback={
              <div className="py-8 text-center text-sm text-neutral-400">Loading projects…</div>
            }
          >
            <ProjectList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
