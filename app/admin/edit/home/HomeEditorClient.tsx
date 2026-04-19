"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ProjectSummary } from "../../../../types";
import { urlFor } from "../../../../lib/sanity";

interface HomeEditorClientProps {
  initialProjects: ProjectSummary[];
}

const DRAG_MIME = "application/x-home-project-id";

export default function HomeEditorClient({ initialProjects }: HomeEditorClientProps) {
  // Sort initial state: selected first (in homeOrder), then unselected (newest first)
  const sortInitial = (list: ProjectSummary[]) => {
    const selected = list
      .filter((p) => p.isSelectedOnHome)
      .sort((a, b) => (a.homeOrder ?? 9999) - (b.homeOrder ?? 9999));
    const unselected = list
      .filter((p) => !p.isSelectedOnHome)
      .sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bDate - aDate;
      });
    return [...selected, ...unselected];
  };

  const [projects, setProjects] = useState<ProjectSummary[]>(sortInitial(initialProjects));
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPlacement, setDropPlacement] = useState<"before" | "after">("before");

  const toggleSelected = (id: string) => {
    setProjects((prev) => {
      const next = prev.map((p) =>
        p._id === id ? { ...p, isSelectedOnHome: !p.isSelectedOnHome } : p,
      );
      // Move newly-selected items to the end of the selected block, unselected to the top of unselected
      return sortInitial(next);
    });
    setIsDirty(true);
  };

  const reorderByDrop = (sourceId: string, targetId: string, placement: "before" | "after") => {
    if (sourceId === targetId) return;
    setProjects((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((p) => p._id === sourceId);
      if (fromIdx === -1) return prev;
      const [moved] = arr.splice(fromIdx, 1);
      let toIdx = arr.findIndex((p) => p._id === targetId);
      if (toIdx === -1) {
        arr.push(moved);
      } else {
        if (placement === "after") toIdx += 1;
        arr.splice(toIdx, 0, moved);
      }
      // When dropped in the selected block, treat as selected
      const target = prev.find((p) => p._id === targetId);
      if (target?.isSelectedOnHome) {
        moved.isSelectedOnHome = true;
      }
      return arr;
    });
    setIsDirty(true);
  };

  const save = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    // Assign homeOrder sequentially to selected projects; unselected get homeOrder=null.
    const selectedIds = projects.filter((p) => p.isSelectedOnHome).map((p) => p._id);
    const items = projects.map((p) => ({
      id: p._id,
      isSelectedOnHome: Boolean(p.isSelectedOnHome),
      homeOrder: p.isSelectedOnHome ? selectedIds.indexOf(p._id) : 9999,
    }));

    try {
      const res = await fetch("/api/admin/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Save failed");
      }
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = projects.filter((p) => p.isSelectedOnHome).length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/admin/edit"
              className="text-xs tracking-[0.1em] text-black/40 uppercase hover:text-black"
            >
              ← All projects
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Edit Home Page</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Check projects to include in the &ldquo;Selected Work&rdquo; list, then drag to
              reorder. {selectedCount} selected.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saveError && <span className="text-xs text-red-600">{saveError}</span>}
            {saveSuccess && <span className="text-xs text-green-700">Saved</span>}
            <button
              type="button"
              onClick={save}
              disabled={isSaving || !isDirty}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-100 bg-white shadow-sm">
          {projects.map((project, idx) => {
            const thumbUrl = project.cover_image
              ? urlFor(project.cover_image).width(120).height(80).auto("format").url()
              : null;
            const isDragged = draggingId === project._id;
            const isDropTarget = dragOverId === project._id && draggingId !== project._id;
            const isFirstUnselected =
              !project.isSelectedOnHome &&
              (idx === 0 || projects[idx - 1].isSelectedOnHome === true);

            return (
              <li
                key={project._id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData(DRAG_MIME, project._id);
                  e.dataTransfer.setData("text/plain", project._id);
                  setDraggingId(project._id);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDragOverId(null);
                }}
                onDragOver={(e) => {
                  if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  const rect = e.currentTarget.getBoundingClientRect();
                  const midY = rect.top + rect.height / 2;
                  setDragOverId(project._id);
                  setDropPlacement(e.clientY < midY ? "before" : "after");
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target && dragOverId === project._id) {
                    setDragOverId(null);
                  }
                }}
                onDrop={(e) => {
                  const sourceId = e.dataTransfer.getData(DRAG_MIME);
                  if (!sourceId) return;
                  e.preventDefault();
                  reorderByDrop(sourceId, project._id, dropPlacement);
                  setDragOverId(null);
                  setDraggingId(null);
                }}
                className={`relative flex items-center gap-4 px-4 py-3 transition-colors ${
                  isDragged ? "opacity-40" : ""
                } ${isDropTarget ? "bg-blue-50/40" : ""}`}
              >
                {isFirstUnselected && (
                  <div className="absolute -top-3 right-4 left-4 border-t border-dashed border-neutral-300 text-center">
                    <span className="relative -top-2 inline-block bg-white px-2 text-[0.6rem] tracking-wider text-neutral-400 uppercase">
                      Not on home
                    </span>
                  </div>
                )}
                {isDropTarget && dropPlacement === "before" && (
                  <div className="pointer-events-none absolute -top-[2px] right-0 left-0 h-[2px] bg-blue-500" />
                )}
                {isDropTarget && dropPlacement === "after" && (
                  <div className="pointer-events-none absolute right-0 -bottom-[2px] left-0 h-[2px] bg-blue-500" />
                )}

                {/* Drag grip */}
                <span
                  className="shrink-0 cursor-grab text-neutral-400 active:cursor-grabbing"
                  title="Drag to reorder"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 6 10" width="10" height="14" fill="currentColor">
                    <circle cx="1" cy="1" r="1" />
                    <circle cx="5" cy="1" r="1" />
                    <circle cx="1" cy="5" r="1" />
                    <circle cx="5" cy="5" r="1" />
                    <circle cx="1" cy="9" r="1" />
                    <circle cx="5" cy="9" r="1" />
                  </svg>
                </span>

                {/* Selection checkbox */}
                <input
                  type="checkbox"
                  checked={Boolean(project.isSelectedOnHome)}
                  onChange={() => toggleSelected(project._id)}
                  className="h-4 w-4 accent-neutral-900"
                  aria-label={`Include ${project.title} on home page`}
                />

                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {thumbUrl ? (
                    <Image
                      src={thumbUrl}
                      alt=""
                      width={64}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-neutral-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-neutral-900">{project.title}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] ${
                        project.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  {project.category && (
                    <p className="mt-0.5 text-xs text-neutral-400">{project.category}</p>
                  )}
                </div>

                <Link
                  href={`/admin/edit/${project.slug.current}`}
                  className="shrink-0 text-xs text-neutral-400 hover:text-neutral-700"
                >
                  Open →
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
