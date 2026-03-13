"use client";

import Link from "next/link";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Project, Section, FreeObject } from "../../../../types";
import EditToolbar from "./EditToolbar";
import EditableSection from "./EditableSection";
import EditableFreeObject from "./EditableFreeObject";
import PropertiesPanel from "./PropertiesPanel";

interface EditorClientProps {
  initialProject: Project;
}

type SelectedItem =
  | { kind: "section"; key: string }
  | { kind: "freeObject"; key: string }
  | null;

export default function EditorClient({
  initialProject,
}: EditorClientProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project>(initialProject);
  const [selected, setSelected] = useState<SelectedItem>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sections = project.sections ?? [];
  const freeObjects = project.freeObjects ?? [];

  const selectedSection =
    selected?.kind === "section"
      ? (sections.find((s) => s._key === selected.key) ?? null)
      : null;

  const selectedFreeObject =
    selected?.kind === "freeObject"
      ? (freeObjects.find((o) => o._key === selected.key) ?? null)
      : null;

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
  const updateFreeObject = useCallback(
    (key: string, patch: Partial<FreeObject>) => {
      setProject((prev) => ({
        ...prev,
        freeObjects: (prev.freeObjects ?? []).map((o) =>
          o._key === key ? ({ ...o, ...patch } as FreeObject) : o,
        ),
      }));
      setIsDirty(true);
      setSaveSuccess(false);
    },
    [],
  );

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

  // Save to Sanity (draft)
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

  const handleCancel = useCallback(() => {
    if (isDirty) {
      if (!confirm("Discard unsaved changes?")) return;
    }
    router.push("/admin/edit");
  }, [isDirty, router]);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Sticky top toolbar */}
      <EditToolbar
        project={project}
        isDirty={isDirty}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        saveError={saveError}
        onSaveDraft={() => save("draft")}
        onPublish={() => save("published")}
        onUnpublish={() => save("draft")}
        onCancel={handleCancel}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div
          className="flex-1 overflow-y-auto"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-5xl mx-auto my-6 bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Project header preview */}
            <div className="px-8 py-6 border-b border-neutral-100">
              <h1 className="text-2xl font-semibold text-neutral-900">
                {project.title}
              </h1>
              {project.category && (
                <p className="mt-1 text-sm text-neutral-500">{project.category}</p>
              )}
              {project.tags && project.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neutral-200 px-3 py-0.5 text-xs text-neutral-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Predefined Sections */}
            {sections.length === 0 && freeObjects.length === 0 ? (
              <div className="py-16 text-center text-neutral-400">
                <p className="text-sm">No sections yet.</p>
                <p className="text-xs mt-1">
                  Add sections in{" "}
                  <Link href="/admin/cms" className="underline">
                    Sanity Studio
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <>
                {sections.length > 0 && (
                  <div>
                    <div className="px-4 pt-4 pb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Predefined Sections
                      </span>
                    </div>
                    {sections.map((section, index) => (
                      <EditableSection
                        key={section._key}
                        section={section}
                        index={index}
                        total={sections.length}
                        isSelected={
                          selected?.kind === "section" &&
                          selected.key === section._key
                        }
                        onSelect={(e) => {
                          e.stopPropagation();
                          setSelected({ kind: "section", key: section._key });
                        }}
                        onMoveUp={() => moveSection(section._key, "up")}
                        onMoveDown={() => moveSection(section._key, "down")}
                        onDelete={() => deleteSection(section._key)}
                        onChange={(patch) =>
                          updateSection(section._key, patch)
                        }
                      />
                    ))}
                  </div>
                )}

                {/* Free Objects */}
                {freeObjects.length > 0 && (
                  <div>
                    <div className="px-4 pt-6 pb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        Free Objects
                      </span>
                    </div>
                    <div ref={canvasRef} className="relative" style={{ minHeight: 400 }}>
                      {freeObjects.map((obj) => (
                        <EditableFreeObject
                          key={obj._key}
                          obj={obj}
                          isSelected={
                            selected?.kind === "freeObject" &&
                            selected.key === obj._key
                          }
                          canvasRef={canvasRef}
                          onSelect={(e) => {
                            e.stopPropagation();
                            setSelected({
                              kind: "freeObject",
                              key: obj._key,
                            });
                          }}
                          onDelete={() => deleteFreeObject(obj._key)}
                          onChange={(patch) =>
                            updateFreeObject(obj._key, patch)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="h-16" />
          </div>
        </div>

        {/* Properties panel */}
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
              updateFreeObject(
                selectedFreeObject._key,
                patch as Partial<FreeObject>,
              )
            }
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
