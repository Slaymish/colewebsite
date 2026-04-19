"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProjectSummary } from "../../../types";
import { urlFor } from "../../../lib/sanity";

interface ProjectListClientProps {
  initialProjects: ProjectSummary[];
}

export default function ProjectListClient({ initialProjects }: ProjectListClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Create failed");
      }
      const created = (await res.json()) as {
        _id: string;
        slug: { current: string };
      };
      router.push(`/admin/edit/${created.slug.current}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Create failed");
      setCreating(false);
    }
  }

  async function handleDelete(project: ProjectSummary) {
    if (
      !confirm(
        `Delete "${project.title}"? This permanently removes the project and cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(project._id);
    try {
      const res = await fetch(
        `/api/admin/projects?id=${encodeURIComponent(project._id)}&slug=${encodeURIComponent(project.slug.current)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Delete failed");
      }
      setProjects((prev) => prev.filter((p) => p._id !== project._id));
      startTransition(() => router.refresh());
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="px-2 pt-4 pb-2">
        <div className="mb-2 px-2 text-[0.6rem] font-semibold tracking-[0.15em] text-neutral-400 uppercase">
          Pages
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/admin/edit/home"
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-center text-xs text-neutral-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          >
            Home
          </Link>
          <Link
            href="/admin/edit/about"
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-center text-xs text-neutral-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          >
            About
          </Link>
          <Link
            href="/admin/edit/contact"
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-center text-xs text-neutral-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          >
            Contact
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <span className="text-[0.6rem] font-semibold tracking-[0.15em] text-neutral-400 uppercase">
          Projects · {projects.length}
        </span>
        <button
          type="button"
          onClick={() => {
            setShowCreate(true);
            setNewTitle("");
            setCreateError(null);
          }}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
        >
          + New project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="py-16 text-center text-neutral-400">
          <p>No projects yet.</p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-3 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs text-neutral-600 transition-colors hover:border-blue-400 hover:text-blue-600"
          >
            + Create your first project
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {projects.map((project) => {
            const thumbUrl = project.cover_image
              ? urlFor(project.cover_image).width(120).height(80).auto("format").url()
              : null;
            const isDeleting = deletingId === project._id;

            return (
              <li key={project._id} className="group relative">
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
                      <span className="truncate font-medium text-neutral-900">{project.title}</span>
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

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(project);
                  }}
                  disabled={isDeleting || isPending}
                  className="absolute top-1/2 right-10 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  title="Delete project"
                  aria-label={`Delete ${project.title}`}
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !creating && setShowCreate(false)}
        >
          <form
            onSubmit={handleCreate}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-900">New project</h3>
              <button
                type="button"
                onClick={() => !creating && setShowCreate(false)}
                className="p-1 text-lg leading-none text-neutral-400 hover:text-neutral-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <label className="block text-xs font-medium tracking-wide text-neutral-500 uppercase">
              Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Untitled project"
              autoFocus
              disabled={creating}
              className="mt-1 w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none"
            />
            <p className="mt-2 text-xs text-neutral-400">
              A slug will be generated from the title. You can edit everything else from the editor.
            </p>

            {createError && <p className="mt-3 text-xs text-red-600">{createError}</p>}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => !creating && setShowCreate(false)}
                disabled={creating}
                className="rounded-lg px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !newTitle.trim()}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {creating ? "Creating…" : "Create project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
