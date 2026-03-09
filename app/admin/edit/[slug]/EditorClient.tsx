'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, Section } from '../../../../types'
import EditToolbar from './EditToolbar'
import EditableSection from './EditableSection'
import PropertiesPanel from './PropertiesPanel'

interface EditorClientProps {
  initialProject: Project
}

export default function EditorClient({ initialProject }: EditorClientProps) {
  const router = useRouter()
  const [project, setProject] = useState<Project>(initialProject)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const sections = project.sections ?? []

  const selectedSection = selectedKey
    ? sections.find((s) => s._key === selectedKey) ?? null
    : null

  // Update a section by key
  const updateSection = useCallback((key: string, patch: Partial<Section>) => {
    setProject((prev) => ({
      ...prev,
      sections: (prev.sections ?? []).map((s) =>
        s._key === key ? ({ ...s, ...patch } as Section) : s,
      ),
    }))
    setIsDirty(true)
    setSaveSuccess(false)
  }, [])

  // Move section up or down
  const moveSection = useCallback((key: string, direction: 'up' | 'down') => {
    setProject((prev) => {
      const secs = [...(prev.sections ?? [])]
      const idx = secs.findIndex((s) => s._key === key)
      if (idx === -1) return prev
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= secs.length) return prev
      ;[secs[idx], secs[newIdx]] = [secs[newIdx], secs[idx]]
      return { ...prev, sections: secs }
    })
    setIsDirty(true)
  }, [])

  // Delete a section
  const deleteSection = useCallback(
    (key: string) => {
      setProject((prev) => ({
        ...prev,
        sections: (prev.sections ?? []).filter((s) => s._key !== key),
      }))
      if (selectedKey === key) setSelectedKey(null)
      setIsDirty(true)
    },
    [selectedKey],
  )

  // Save to Sanity (draft)
  const save = useCallback(
    async (newStatus?: 'draft' | 'published') => {
      setIsSaving(true)
      setSaveError(null)

      try {
        const res = await fetch('/api/admin/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project._id,
            slug: project.slug.current,
            sections: project.sections ?? [],
            status: newStatus ?? project.status,
            title: project.title,
            meta_description: project.meta_description,
            tags: project.tags,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Save failed')
        }

        setIsDirty(false)
        setSaveSuccess(true)
        if (newStatus) {
          setProject((prev) => ({ ...prev, status: newStatus }))
        }
        setTimeout(() => setSaveSuccess(false), 3000)
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Save failed')
      } finally {
        setIsSaving(false)
      }
    },
    [project],
  )

  const handleCancel = useCallback(() => {
    if (isDirty) {
      if (!confirm('Discard unsaved changes?')) return
    }
    router.push('/admin/edit')
  }, [isDirty, router])

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Sticky top toolbar */}
      <EditToolbar
        project={project}
        isDirty={isDirty}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        saveError={saveError}
        onSaveDraft={() => save('draft')}
        onPublish={() => save('published')}
        onUnpublish={() => save('draft')}
        onCancel={handleCancel}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div
          className="flex-1 overflow-y-auto"
          onClick={() => setSelectedKey(null)}
        >
          <div className="max-w-5xl mx-auto my-6 bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Project header preview */}
            <div className="px-8 py-6 border-b border-neutral-100">
              <h1 className="text-2xl font-semibold text-neutral-900">{project.title}</h1>
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

            {/* Sections */}
            {sections.length === 0 ? (
              <div className="py-16 text-center text-neutral-400">
                <p className="text-sm">No sections yet.</p>
                <p className="text-xs mt-1">Add sections in{' '}
                  <a href="/admin/cms" className="underline">Sanity Studio</a>.
                </p>
              </div>
            ) : (
              sections.map((section, index) => (
                <EditableSection
                  key={section._key}
                  section={section}
                  index={index}
                  total={sections.length}
                  isSelected={selectedKey === section._key}
                  onSelect={(e) => {
                    e.stopPropagation()
                    setSelectedKey(section._key)
                  }}
                  onMoveUp={() => moveSection(section._key, 'up')}
                  onMoveDown={() => moveSection(section._key, 'down')}
                  onDelete={() => deleteSection(section._key)}
                  onChange={(patch) => updateSection(section._key, patch)}
                />
              ))
            )}

            <div className="h-16" />
          </div>
        </div>

        {/* Properties panel */}
        {selectedSection && (
          <PropertiesPanel
            section={selectedSection}
            onChange={(patch) => updateSection(selectedSection._key, patch)}
            onClose={() => setSelectedKey(null)}
          />
        )}
      </div>
    </div>
  )
}
