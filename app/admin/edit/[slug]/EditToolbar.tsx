'use client'

import Link from 'next/link'
import type { Project } from '../../../../types'

interface EditToolbarProps {
  project: Project
  isDirty: boolean
  isSaving: boolean
  saveSuccess: boolean
  saveError: string | null
  onSaveDraft: () => void
  onPublish: () => void
  onUnpublish: () => void
  onCancel: () => void
}

export default function EditToolbar({
  project,
  isDirty,
  isSaving,
  saveSuccess,
  saveError,
  onSaveDraft,
  onPublish,
  onUnpublish,
  onCancel,
}: EditToolbarProps) {
  const isPublished = project.status === 'published'

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="flex items-center gap-3 px-4 h-14">
        {/* Back */}
        <Link
          href="/admin/edit"
          className="shrink-0 text-neutral-400 hover:text-neutral-700 transition-colors text-sm flex items-center gap-1"
        >
          ← Projects
        </Link>

        <div className="w-px h-5 bg-neutral-200 shrink-0" />

        {/* Title + status */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-medium text-neutral-900 truncate text-sm">{project.title}</span>
          <span
            className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
              isPublished ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Status/feedback */}
        <div className="shrink-0 text-xs">
          {saveError && (
            <span className="text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded">
              {saveError}
            </span>
          )}
          {saveSuccess && !saveError && (
            <span className="text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded">
              Saved
            </span>
          )}
          {isDirty && !saveError && !saveSuccess && (
            <span className="text-neutral-400">Unsaved changes</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Preview in new tab */}
          {isPublished && (
            <a
              href={`/project/${project.slug.current}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-md hover:bg-neutral-100 transition-colors"
            >
              Preview ↗
            </a>
          )}

          <button
            onClick={onCancel}
            className="text-xs text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-md hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onSaveDraft}
            disabled={isSaving || !isDirty}
            className="text-xs px-3 py-1.5 rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving…' : 'Save draft'}
          </button>

          {isPublished ? (
            <button
              onClick={onUnpublish}
              disabled={isSaving}
              className="text-xs px-3 py-1.5 rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={onPublish}
              disabled={isSaving}
              className="text-xs px-3 py-1.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Publishing…' : 'Publish'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
