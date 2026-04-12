'use client'

import React, { useRef } from 'react'
import type { Section } from '../../../../types'
import HeroSectionComponent from '../../../../components/sections/HeroSection'
import TextSectionComponent from '../../../../components/sections/TextSection'
import ImageSectionComponent from '../../../../components/sections/ImageSection'
import GallerySectionComponent from '../../../../components/sections/GallerySection'
import SpacingSectionComponent from '../../../../components/sections/SpacingSection'
import VideoSectionComponent from '../../../../components/sections/VideoSection'
import SplitSectionComponent from '../../../../components/sections/SplitSection'

interface EditableSectionProps {
  section: Section
  index: number
  total: number
  isSelected: boolean
  onSelect: (e: React.MouseEvent) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onChange: (patch: Partial<Section>) => void
}

function sectionLabel(type: string): string {
  const labels: Record<string, string> = {
    heroSection: 'Hero',
    textSection: 'Text',
    imageSection: 'Image',
    gallerySection: 'Gallery',
    videoSection: 'Video',
    splitSection: 'Split',
    spacingSection: 'Spacing',
  }
  return labels[type] ?? type
}

function getSectionCustomTitle(section: Section): string | undefined {
  if ('sectionTitle' in section) return (section as { sectionTitle?: string }).sectionTitle
  return undefined
}

export default function EditableSection({
  section,
  index,
  total,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: EditableSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className={`relative transition-all ${
        isSelected
          ? 'ring-2 ring-inset ring-blue-500'
          : 'hover:ring-1 hover:ring-inset hover:ring-blue-200'
      }`}
      onClick={onSelect}
    >
      {/* Section toolbar */}
      <div
        className={`absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-2 py-1 transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{ background: 'rgba(59,130,246,0.9)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white text-xs font-medium px-1">
          {getSectionCustomTitle(section) ?? sectionLabel(section._type)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="text-white/80 hover:text-white disabled:opacity-30 text-sm px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="text-white/80 hover:text-white disabled:opacity-30 text-sm px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`Delete this ${sectionLabel(section._type)} section?`)) {
                onDelete()
              }
            }}
            className="text-white/80 hover:text-red-200 text-sm px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
            title="Delete section"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Section content */}
      <div style={{ pointerEvents: 'none' }}>
        {section._type === 'spacingSection' ? (
          <div
            className="flex items-center justify-center border border-dashed border-neutral-300 bg-neutral-50/50 text-xs text-neutral-400"
            style={{ height: (section as import('../../../../types').SpacingSection).height ?? 80 }}
          >
            Spacing · {(section as import('../../../../types').SpacingSection).height ?? 80}px
          </div>
        ) : (
          renderSection(section)
        )}
      </div>
    </div>
  )
}

function renderSection(section: Section) {
  switch (section._type) {
    case 'heroSection':
      return <HeroSectionComponent section={section} />
    case 'textSection':
      return <TextSectionComponent section={section} />
    case 'imageSection':
      return <ImageSectionComponent section={section} />
    case 'gallerySection':
      return <GallerySectionComponent section={section} />
    case 'videoSection':
      return <VideoSectionComponent section={section} />
    case 'splitSection':
      return <SplitSectionComponent section={section} />
    case 'spacingSection':
      return <SpacingSectionComponent section={section} />
    default:
      return null
  }
}
