'use client'

import React, { useRef, useCallback } from 'react'
import type { Section, ImageSection } from '../../../../types'
import { urlFor } from '../../../../lib/sanity'
import Image from 'next/image'
import HeroSectionComponent from '../../../../components/sections/HeroSection'
import TextSectionComponent from '../../../../components/sections/TextSection'
import ImageSectionComponent from '../../../../components/sections/ImageSection'
import GallerySectionComponent from '../../../../components/sections/GallerySection'
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
  }
  return labels[type] ?? type
}

type DragType = 'move' | 'resize-br' | 'resize-bl' | 'resize-tr' | 'resize-tl'

interface DraggableImageOverlayProps {
  section: ImageSection
  onChange: (patch: Partial<ImageSection>) => void
  containerRef: React.RefObject<HTMLDivElement>
}

// Hooks are always called first — no conditional before hooks.
function DraggableImageOverlay({ section, onChange, containerRef }: DraggableImageOverlayProps) {
  const xPercent = section.xPercent ?? 0
  const yPercent = section.yPercent ?? 0
  const widthPercent = section.widthPercent ?? 100
  const rotation = section.rotation ?? 0
  const opacity = section.opacity ?? 1
  const zIndex = section.zIndex ?? 0

  const dragState = useRef<{
    type: DragType
    startX: number
    startY: number
    startXPct: number
    startYPct: number
    startWPct: number
  } | null>(null)

  const startInteraction = useCallback(
    (e: React.MouseEvent, type: DragType) => {
      e.preventDefault()
      e.stopPropagation()

      dragState.current = {
        type,
        startX: e.clientX,
        startY: e.clientY,
        startXPct: xPercent,
        startYPct: yPercent,
        startWPct: widthPercent,
      }

      const onMouseMove = (me: MouseEvent) => {
        if (!dragState.current || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const dx = ((me.clientX - dragState.current.startX) / rect.width) * 100
        const dy = ((me.clientY - dragState.current.startY) / rect.height) * 100

        if (dragState.current.type === 'move') {
          onChange({
            xPercent: Math.round(dragState.current.startXPct + dx),
            yPercent: Math.round(dragState.current.startYPct + dy),
          })
        } else {
          const sign = dragState.current.type.endsWith('r') ? 1 : -1
          const newW = Math.max(10, dragState.current.startWPct + dx * sign)
          onChange({ widthPercent: Math.round(newW) })
        }
      }

      const onMouseUp = () => {
        dragState.current = null
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [xPercent, yPercent, widthPercent, onChange, containerRef],
  )

  // Guard after hooks
  if (!section.image) return null

  const imageUrl = urlFor(section.image).width(1400).auto('format').url()
  const thumbUrl = urlFor(section.image).width(40).blur(10).url()
  const objectFit = (section.objectFit as 'cover' | 'contain' | 'fill') ?? 'cover'

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    width: 14,
    height: 14,
    background: 'white',
    border: '2px solid #3b82f6',
    borderRadius: 3,
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: `${widthPercent}%`,
        zIndex,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        opacity,
        cursor: 'move',
        userSelect: 'none',
      }}
      onMouseDown={(e) => startInteraction(e, 'move')}
    >
      <Image
        src={imageUrl}
        alt={section.image.alt ?? ''}
        width={1400}
        height={875}
        className="w-full h-auto block"
        style={{ objectFit, filter: section.grayscale ? 'grayscale(1)' : undefined }}
        placeholder={thumbUrl ? 'blur' : 'empty'}
        blurDataURL={thumbUrl}
        draggable={false}
      />

      {/* Resize handles */}
      <div
        style={{ ...handleStyle, bottom: -6, right: -6, cursor: 'se-resize', zIndex: 10 }}
        onMouseDown={(e) => startInteraction(e, 'resize-br')}
      />
      <div
        style={{ ...handleStyle, bottom: -6, left: -6, cursor: 'sw-resize', zIndex: 10 }}
        onMouseDown={(e) => startInteraction(e, 'resize-bl')}
      />
      <div
        style={{ ...handleStyle, top: -6, right: -6, cursor: 'ne-resize', zIndex: 10 }}
        onMouseDown={(e) => startInteraction(e, 'resize-tr')}
      />
      <div
        style={{ ...handleStyle, top: -6, left: -6, cursor: 'nw-resize', zIndex: 10 }}
        onMouseDown={(e) => startInteraction(e, 'resize-tl')}
      />

      {/* Move hint */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(59,130,246,0.85)',
          color: 'white',
          fontSize: 11,
          padding: '3px 8px',
          borderRadius: 4,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        ✥ drag to move
      </div>

      {/* Blue outline */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          outline: '2px solid #3b82f6',
          outlineOffset: 2,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
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
  onChange,
}: EditableSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isFreeImage =
    section._type === 'imageSection' && (section as ImageSection).positionMode === 'free'
  const sectionHeight = isFreeImage ? ((section as ImageSection).sectionHeight ?? 500) : undefined

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
          {sectionLabel(section._type)}
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
      {isFreeImage ? (
        <div
          style={{
            position: 'relative',
            height: sectionHeight,
            overflow: 'hidden',
            background: '#f5f5f5',
          }}
        >
          <DraggableImageOverlay
            section={section as ImageSection}
            onChange={(patch) => onChange(patch as Partial<Section>)}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
          />
          {isSelected && (
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 3,
                pointerEvents: 'none',
              }}
            >
              Free canvas — {sectionHeight}px
            </div>
          )}
        </div>
      ) : (
        <div style={{ pointerEvents: 'none' }}>{renderSection(section)}</div>
      )}
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
    default:
      return null
  }
}
