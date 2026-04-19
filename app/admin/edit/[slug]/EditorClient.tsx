"use client";

import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  Project,
  ProjectSummary,
  SiteSettings,
  Section,
  FreeObject,
  SpacingSection,
} from "../../../../types";
import { urlFor } from "../../../../lib/sanity";
import Header from "../../../../components/Header";
import EditableSection from "./EditableSection";
import EditableFreeObject from "./EditableFreeObject";
import PropertiesPanel from "./PropertiesPanel";

interface EditorClientProps {
  initialProject: Project;
  projects: ProjectSummary[];
  settings: SiteSettings | null;
}

type SelectedItem =
  | { kind: "section"; key: string }
  | { kind: "freeObject"; key: string }
  | { kind: "pageSettings" }
  | null;

export default function EditorClient({ initialProject, projects, settings }: EditorClientProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project>(initialProject);
  const [selected, setSelected] = useState<SelectedItem>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasMinHeight, setCanvasMinHeight] = useState(500);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  const sections = project.sections ?? [];
  const freeObjects = project.freeObjects ?? [];

  const selectedSection =
    selected?.kind === "section" ? (sections.find((s) => s._key === selected.key) ?? null) : null;

  const selectedFreeObject =
    selected?.kind === "freeObject"
      ? (freeObjects.find((o) => o._key === selected.key) ?? null)
      : null;

  const showPageSettings = selected?.kind === "pageSettings";

  // Close panel on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Update a section by key
  const updateSection = useCallback((key: string, patch: Partial<Section>) => {
    setProject((prev) => ({
      ...prev,
      sections: (prev.sections ?? []).map((s) =>
        s._key === key ? ({ ...s, ...patch } as Section) : s,
      ),
    }));
    setIsDirty(true);
    setSaveSuccess(false);
  }, []);

  // Update a free object by key
  const updateFreeObject = useCallback((key: string, patch: Partial<FreeObject>) => {
    setProject((prev) => ({
      ...prev,
      freeObjects: (prev.freeObjects ?? []).map((o) =>
        o._key === key ? ({ ...o, ...patch } as FreeObject) : o,
      ),
    }));
    setIsDirty(true);
    setSaveSuccess(false);
  }, []);

  // Update project-level fields
  const updateProject = useCallback((patch: Partial<Project>) => {
    setProject((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
    setSaveSuccess(false);
  }, []);

  // Move section up or down
  const moveSection = useCallback((key: string, direction: "up" | "down") => {
    setProject((prev) => {
      const secs = [...(prev.sections ?? [])];
      const idx = secs.findIndex((s) => s._key === key);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= secs.length) return prev;
      [secs[idx], secs[newIdx]] = [secs[newIdx], secs[idx]];
      return { ...prev, sections: secs };
    });
    setIsDirty(true);
  }, []);

  // Delete a section
  const deleteSection = useCallback(
    (key: string) => {
      setProject((prev) => ({
        ...prev,
        sections: (prev.sections ?? []).filter((s) => s._key !== key),
      }));
      if (selected?.kind === "section" && selected.key === key) setSelected(null);
      setIsDirty(true);
    },
    [selected],
  );

  // Add a new section of a given type with sensible defaults
  const addSection = useCallback((type: string) => {
    const key = `${type}-${Date.now()}`;
    let newSection: Section;

    switch (type) {
      case "textSection":
        newSection = { _type: "textSection", _key: key, content: [] };
        break;
      case "imageSection":
        newSection = { _type: "imageSection", _key: key };
        break;
      case "gallerySection":
        newSection = {
          _type: "gallerySection",
          _key: key,
          columns: 2,
          gap: 12,
          aspectRatio: "3/2",
          borderRadius: 2,
        };
        break;
      case "videoSection":
        newSection = {
          _type: "videoSection",
          _key: key,
          aspectRatio: "16/9",
          borderRadius: 2,
        };
        break;
      case "heroSection":
        newSection = {
          _type: "heroSection",
          _key: key,
          minHeight: "60vh",
          overlayOpacity: 0.3,
          textAlign: "left",
          textPosition: "bottom",
        };
        break;
      case "splitSection":
        newSection = {
          _type: "splitSection",
          _key: key,
          imagePosition: "left",
          verticalAlign: "center",
          gap: 24,
          imageAspectRatio: "4/3",
          borderRadius: 2,
        };
        break;
      case "spacingSection":
        newSection = {
          _type: "spacingSection",
          _key: key,
          height: 80,
        } as SpacingSection;
        break;
      default:
        return;
    }

    setProject((prev) => ({
      ...prev,
      sections: [...(prev.sections ?? []), newSection],
    }));
    setIsDirty(true);
    setSaveSuccess(false);
  }, []);

  // Delete a free object
  const deleteFreeObject = useCallback(
    (key: string) => {
      setProject((prev) => ({
        ...prev,
        freeObjects: (prev.freeObjects ?? []).filter((o) => o._key !== key),
      }));
      if (selected?.kind === "freeObject" && selected.key === key) setSelected(null);
      setIsDirty(true);
    },
    [selected],
  );

  // Save to Sanity
  const save = useCallback(
    async (newStatus?: "draft" | "published") => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const res = await fetch("/api/admin/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project._id,
            slug: project.slug.current,
            sections: project.sections ?? [],
            freeObjects: project.freeObjects ?? [],
            status: newStatus ?? project.status,
            title: project.title,
            meta_description: project.meta_description,
            category: project.category ?? "",
            tags: project.tags,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Save failed");
        }

        setIsDirty(false);
        setSaveSuccess(true);
        if (newStatus) {
          setProject((prev) => ({ ...prev, status: newStatus }));
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Save failed");
      } finally {
        setIsSaving(false);
      }
    },
    [project],
  );

  const handleExit = useCallback(() => {
    if (isDirty) {
      if (!confirm("Discard unsaved changes?")) return;
    }
    router.push("/admin/edit");
  }, [isDirty, router]);

  const isPublished = project.status === "published";

  // Cover image
  const coverUrl = project.cover_image?.asset
    ? (() => {
        try {
          return urlFor(project.cover_image).width(1400).auto("format").url();
        } catch {
          const asset = project.cover_image!.asset as { url?: string };
          return asset.url ?? null;
        }
      })()
    : null;

  // Determine if right panel is open
  const panelOpen = selectedSection || selectedFreeObject || showPageSettings;

  // Sidebar logo / initials
  const sidebarName = settings?.name ?? "Cole Anderson";
  const sidebarLogoUrl =
    settings?.logo?.asset && "_id" in settings.logo.asset
      ? urlFor(settings.logo).width(128).height(128).auto("format").url()
      : null;
  const sidebarInitials = sidebarName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={
        sidebarCollapsed
          ? "flex min-h-screen"
          : "min-h-screen md:grid md:grid-cols-[minmax(260px,22vw)_minmax(0,1fr)]"
      }
    >
      {/* Left sidebar */}
      {sidebarCollapsed ? (
        <div className="hidden md:flex md:w-14 md:shrink-0 md:flex-col md:items-center md:gap-4 md:border-r md:border-black/10 md:py-5">
          <button
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Open sidebar"
            className="group flex flex-col items-center gap-1"
          >
            {sidebarLogoUrl ? (
              <span className="relative h-9 w-9 overflow-hidden rounded-full border border-black/10 bg-white transition-colors group-hover:border-black/25">
                <Image
                  src={sidebarLogoUrl}
                  alt={sidebarName}
                  width={72}
                  height={72}
                  className="h-full w-full object-cover"
                />
              </span>
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] text-[0.65rem] font-semibold text-neutral-700 transition-colors group-hover:border-black/30">
                {sidebarInitials || "—"}
              </span>
            )}
            <span className="text-[0.6rem] text-black/35 transition-colors group-hover:text-black/60">
              menu
            </span>
          </button>
        </div>
      ) : (
        <div className="relative">
          <Header settings={settings} projects={projects} activeSlug={project.slug.current} />
          <button
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse sidebar"
            className="absolute top-3 right-3 hidden items-center gap-1 rounded px-1.5 py-1 text-[0.72rem] text-black/35 transition-colors hover:bg-black/5 hover:text-black/70 md:flex"
            title="Hide sidebar"
          >
            ←
          </button>
        </div>
      )}

      {/* Main editor area */}
      <div
        className={`relative min-w-0 overflow-y-auto${sidebarCollapsed ? "flex-1" : ""}`}
        onClick={() => setSelected(null)}
      >
        {/* Floating editor bar */}
        <div className="pointer-events-none sticky top-0 z-40 px-5 pt-4 pb-2 md:px-10 xl:px-12">
          <div className="flex items-center justify-end">
            <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-black/10 bg-white/90 px-3 py-2 shadow-lg backdrop-blur">
              {/* Status indicator */}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isPublished ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {isPublished ? "Published" : "Draft"}
              </span>

              {/* Save feedback */}
              {saveError && <span className="text-xs text-red-600">{saveError}</span>}
              {saveSuccess && !saveError && <span className="text-xs text-green-700">Saved</span>}
              {isDirty && !saveError && !saveSuccess && (
                <span className="text-xs text-neutral-400">Unsaved</span>
              )}

              <div className="h-4 w-px bg-black/10" />

              {/* Page settings */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected({ kind: "pageSettings" });
                }}
                className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  showPageSettings
                    ? "bg-blue-100 text-blue-700"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                Settings
              </button>

              {/* Preview */}
              {isPublished && (
                <a
                  href={`/project/${project.slug.current}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                >
                  Preview ↗
                </a>
              )}

              {/* Save draft */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  save("draft");
                }}
                disabled={isSaving || !isDirty}
                className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSaving ? "Saving…" : "Save draft"}
              </button>

              {/* Publish / Unpublish */}
              {isPublished ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    save("draft");
                  }}
                  disabled={isSaving}
                  className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    save("published");
                  }}
                  disabled={isSaving}
                  className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Publish
                </button>
              )}

              <div className="h-4 w-px bg-black/10" />

              {/* Exit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExit();
                }}
                className="rounded-lg px-1.5 py-1 text-xs text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                title="Exit editor"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Project content — matches public page layout */}
        <div className="w-full max-w-[1040px] px-5 py-6 pb-16 md:px-10 md:py-8 md:pb-20 xl:px-12">
          <div className="flex flex-col gap-6">
            {/* Cover image — matches public page */}
            {coverUrl && (
              <figure className="-mx-5 w-[calc(100%+2.5rem)] max-w-none overflow-hidden bg-black/5 md:-mx-10 md:w-[calc(100%+5rem)] xl:-mx-12 xl:w-[calc(100%+6rem)]">
                <Image
                  src={coverUrl}
                  alt={project.cover_image?.alt ?? project.title}
                  width={1400}
                  height={875}
                  className="h-auto w-full"
                  priority
                  sizes="(max-width: 899px) 100vw, min(1040px, 78vw)"
                />
              </figure>
            )}

            {/* Title — matches public page */}
            <div className="flex flex-col gap-3 pb-1">
              <h1 className="text-[clamp(1.2rem,2vw,1.55rem)] leading-[1.2] font-medium tracking-[-0.02em]">
                {project.title}
              </h1>
            </div>

            {/* Sections + free objects */}
            {sections.length === 0 && freeObjects.length === 0 ? (
              <div className="py-16 text-center text-neutral-400">
                <p className="text-sm">No sections yet.</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddSection(true);
                  }}
                  className="mt-3 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs text-neutral-600 transition-colors hover:border-blue-400 hover:text-blue-600"
                >
                  + Add Section
                </button>
              </div>
            ) : (
              <div
                ref={canvasRef}
                className={`relative${freeObjects.length > 0 ? "md:min-h-[500px]" : ""}`}
                style={{
                  minHeight: freeObjects.length > 0 ? canvasMinHeight : undefined,
                }}
              >
                {/* Sections wrapper — matches SectionRenderer gap */}
                {sections.length > 0 && (
                  <div className="flex flex-col gap-6 md:gap-9">
                    {sections.map((section, index) => (
                      <EditableSection
                        key={section._key}
                        section={section}
                        index={index}
                        total={sections.length}
                        isSelected={selected?.kind === "section" && selected.key === section._key}
                        onSelect={(e) => {
                          e.stopPropagation();
                          setSelected({
                            kind: "section",
                            key: section._key,
                          });
                        }}
                        onMoveUp={() => moveSection(section._key, "up")}
                        onMoveDown={() => moveSection(section._key, "down")}
                        onDelete={() => deleteSection(section._key)}
                        onChange={(patch) => updateSection(section._key, patch)}
                      />
                    ))}
                  </div>
                )}
                {freeObjects.map((obj) => (
                  <EditableFreeObject
                    key={obj._key}
                    obj={obj}
                    isSelected={selected?.kind === "freeObject" && selected.key === obj._key}
                    canvasRef={canvasRef}
                    onSelect={(e) => {
                      e.stopPropagation();
                      setSelected({
                        kind: "freeObject",
                        key: obj._key,
                      });
                    }}
                    onDelete={() => deleteFreeObject(obj._key)}
                    onChange={(patch) => updateFreeObject(obj._key, patch)}
                    onExpandCanvas={(h) => setCanvasMinHeight((prev) => Math.max(prev, h))}
                  />
                ))}
              </div>
            )}

            {/* Add Section button */}
            <div
              className="flex justify-center border-t border-neutral-100 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAddSection(true)}
                className="rounded-full border border-neutral-300 bg-white px-5 py-1.5 text-xs text-neutral-600 transition-colors hover:border-blue-400 hover:text-blue-600"
              >
                + Add Section
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right properties drawer — overlays canvas */}
      {panelOpen && (
        <div className="fixed top-0 right-0 bottom-0 z-50 flex">
          {/* Backdrop — click to close */}
          <div
            className="hidden md:block md:w-[calc(100vw-320px)]"
            onClick={() => setSelected(null)}
          />
          {selectedSection && (
            <PropertiesPanel
              section={selectedSection}
              onChange={(patch) => updateSection(selectedSection._key, patch)}
              onClose={() => setSelected(null)}
            />
          )}
          {selectedFreeObject && (
            <PropertiesPanel
              freeObject={selectedFreeObject}
              onChange={(patch) =>
                updateFreeObject(selectedFreeObject._key, patch as Partial<FreeObject>)
              }
              onClose={() => setSelected(null)}
            />
          )}
          {showPageSettings && (
            <PropertiesPanel
              project={project}
              onChange={(patch) => updateProject(patch)}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      )}

      {/* Add Section modal */}
      {showAddSection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowAddSection(false)}
        >
          <div
            className="w-80 rounded-xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">Add Section</h3>
              <button
                onClick={() => setShowAddSection(false)}
                className="p-1 text-lg leading-none text-neutral-400 hover:text-neutral-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: "textSection", label: "Text" },
                { type: "imageSection", label: "Image" },
                { type: "gallerySection", label: "Gallery" },
                { type: "videoSection", label: "Video" },
                { type: "splitSection", label: "Split" },
                { type: "spacingSection", label: "Spacing" },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => {
                    addSection(type);
                    setShowAddSection(false);
                  }}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-left text-sm text-neutral-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
