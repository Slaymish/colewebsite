"use client";

import Link from "next/link";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Project, Section, FreeObject, SpacingSection } from "../../../../types";
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
  const [canvasMinHeight, setCanvasMinHeight] = useState(500);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

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
        newSection = { _type: "gallerySection", _key: key, columns: 2, gap: 12, aspectRatio: "3/2", borderRadius: 2 };
        break;
      case "videoSection":
        newSection = { _type: "videoSection", _key: key, aspectRatio: "16/9", borderRadius: 2 };
        break;
      case "heroSection":
        newSection = { _type: "heroSection", _key: key, minHeight: "60vh", overlayOpacity: 0.3, textAlign: "left", textPosition: "bottom" };
        break;
      case "splitSection":
        newSection = { _type: "splitSection", _key: key, imagePosition: "left", verticalAlign: "center", gap: 24, imageAspectRatio: "4/3", borderRadius: 2 };
        break;
      case "spacingSection":
        newSection = { _type: "spacingSection", _key: key, height: 80 } as SpacingSection;
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

            {/* Shared canvas: sections in flow, free objects as absolute overlays */}
            {sections.length === 0 && freeObjects.length === 0 ? (
              <div className="py-16 text-center text-neutral-400">
                <p className="text-sm">No sections yet.</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAddSection(true); }}
                  className="mt-3 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs text-neutral-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  + Add Section
                </button>
              </div>
            ) : (
              <div
                ref={canvasRef}
                className="relative"
                style={{ minHeight: freeObjects.length > 0 ? canvasMinHeight : undefined }}
              >
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
                    onChange={(patch) => updateSection(section._key, patch)}
                  />
                ))}
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
                      setSelected({ kind: "freeObject", key: obj._key });
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
              className="flex justify-center py-4 border-t border-neutral-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAddSection(true)}
                className="rounded-full border border-neutral-300 bg-white px-5 py-1.5 text-xs text-neutral-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                + Add Section
              </button>
            </div>
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

      {/* Add Section modal */}
      {showAddSection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowAddSection(false)}
        >
          <div
            className="w-80 rounded-xl bg-white shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-900">Add Section</h3>
              <button
                onClick={() => setShowAddSection(false)}
                className="text-neutral-400 hover:text-neutral-700 text-lg leading-none p-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: "heroSection", label: "Hero" },
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
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              Image/gallery/video/hero content must be set in{" "}
              <a href="/admin/cms" target="_blank" className="underline">Sanity Studio</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
