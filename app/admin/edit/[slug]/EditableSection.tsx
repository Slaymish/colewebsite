"use client";

import React, { useRef, useState } from "react";
import type { Section } from "../../../../types";
import HeroSectionComponent from "../../../../components/sections/HeroSection";
import TextSectionComponent from "../../../../components/sections/TextSection";
import ImageSectionComponent from "../../../../components/sections/ImageSection";
import GallerySectionComponent from "../../../../components/sections/GallerySection";
import SpacingSectionComponent from "../../../../components/sections/SpacingSection";
import VideoSectionComponent from "../../../../components/sections/VideoSection";
import SplitSectionComponent from "../../../../components/sections/SplitSection";

interface EditableSectionProps {
  section: Section;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onChange: (patch: Partial<Section>) => void;
  onReorder?: (sourceKey: string, targetKey: string, placement: "before" | "after") => void;
}

const DRAG_MIME = "application/x-section-key";

function sectionLabel(type: string): string {
  const labels: Record<string, string> = {
    heroSection: "Hero",
    textSection: "Text",
    imageSection: "Image",
    gallerySection: "Gallery",
    videoSection: "Video",
    splitSection: "Split",
    spacingSection: "Spacing",
  };
  return labels[type] ?? type;
}

function getSectionCustomTitle(section: Section): string | undefined {
  if ("sectionTitle" in section) return (section as { sectionTitle?: string }).sectionTitle;
  return undefined;
}

/**
 * Returns true when the section is considered "empty" — rendering would yield
 * null on the public page. Used to show an editor placeholder so newly-added
 * sections are visible before the user configures them.
 */
function isEmptySection(section: Section): boolean {
  switch (section._type) {
    case "imageSection":
      return !section.image?.asset;
    case "gallerySection":
      return !section.images?.length;
    case "splitSection":
      return !section.image?.asset;
    case "textSection":
      return !section.content?.length;
    case "videoSection":
      return !section.vimeoUrl && !section.videoFile?.asset?.url;
    case "heroSection":
      return !section.heading && !section.subheading && !section.backgroundImage?.asset;
    case "spacingSection":
      return false;
    default:
      return false;
  }
}

function EmptyPlaceholder({ section }: { section: Section }) {
  const label =
    ("sectionTitle" in section && (section as { sectionTitle?: string }).sectionTitle) ||
    (
      {
        heroSection: "Hero",
        textSection: "Text",
        imageSection: "Image",
        gallerySection: "Gallery",
        videoSection: "Video",
        splitSection: "Split",
        spacingSection: "Spacing",
      } as Record<string, string>
    )[section._type] ||
    section._type;

  const hint: Record<string, string> = {
    heroSection: "Add a heading, subheading, or background image",
    textSection: "Add text content",
    imageSection: "Upload an image",
    gallerySection: "Add images",
    videoSection: "Paste a Vimeo URL",
    splitSection: "Upload an image and add text",
  };

  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 border border-dashed border-neutral-300 bg-neutral-50/60 px-5 py-8 text-center">
      <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
        {label} section
      </span>
      <span className="text-xs text-neutral-400">
        {hint[section._type] ?? "Click to configure this section"}
      </span>
    </div>
  );
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
  onReorder,
}: EditableSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // `draggable` must be toggled on via the grip handle so the whole section
  // doesn't get picked up when the user tries to click/select it.
  const [isDraggable, setIsDraggable] = useState(false);
  // Tracks drop indicator: whether a drop would go above or below this section
  const [dropIndicator, setDropIndicator] = useState<"before" | "after" | null>(null);
  // Whether this section is currently being dragged (fades it out)
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(DRAG_MIME, section._key);
    e.dataTransfer.setData("text/plain", section._key);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDraggable(false);
    setIsDragging(false);
    setDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Only accept drags that originated from another section
    if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDropIndicator(e.clientY < midY ? "before" : "after");
  };

  const handleDragLeave = () => {
    setDropIndicator(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!onReorder) return;
    const sourceKey = e.dataTransfer.getData(DRAG_MIME);
    if (!sourceKey || sourceKey === section._key) {
      setDropIndicator(null);
      return;
    }
    e.preventDefault();
    onReorder(sourceKey, section._key, dropIndicator ?? "before");
    setDropIndicator(null);
  };

  return (
    <div
      ref={containerRef}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative transition-all ${
        isSelected
          ? "ring-2 ring-blue-500 ring-inset"
          : "hover:ring-1 hover:ring-blue-200 hover:ring-inset"
      } ${isDragging ? "opacity-40" : ""}`}
      style={{ cursor: isDraggable ? "grabbing" : undefined }}
      onClick={onSelect}
    >
      {/* Drop indicator — shown while another section is hovering over this one */}
      {dropIndicator === "before" && (
        <div className="pointer-events-none absolute -top-1 right-0 left-0 z-50 h-[3px] bg-blue-500" />
      )}
      {dropIndicator === "after" && (
        <div className="pointer-events-none absolute right-0 -bottom-1 left-0 z-50 h-[3px] bg-blue-500" />
      )}

      {/* Section toolbar */}
      <div
        className={`absolute top-0 right-0 left-0 z-40 flex items-center justify-between px-2 py-1 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{ background: "rgba(59,130,246,0.9)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          {/* Drag grip — mousedown enables native drag on the wrapper */}
          <button
            type="button"
            onMouseDown={() => setIsDraggable(true)}
            onMouseUp={() => {
              // If a drag never started, release the draggable flag
              if (!isDragging) setIsDraggable(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex cursor-grab items-center px-1 py-0.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white active:cursor-grabbing"
            title="Drag to reorder"
            aria-label="Drag to reorder"
          >
            {/* 6-dot grip icon */}
            <svg viewBox="0 0 6 10" width="8" height="12" fill="currentColor" aria-hidden="true">
              <circle cx="1" cy="1" r="1" />
              <circle cx="5" cy="1" r="1" />
              <circle cx="1" cy="5" r="1" />
              <circle cx="5" cy="5" r="1" />
              <circle cx="1" cy="9" r="1" />
              <circle cx="5" cy="9" r="1" />
            </svg>
          </button>
          <span className="px-1 text-xs font-medium text-white">
            {getSectionCustomTitle(section) ?? sectionLabel(section._type)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded px-1.5 py-0.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="rounded px-1.5 py-0.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete this ${sectionLabel(section._type)} section?`)) {
                onDelete();
              }
            }}
            className="rounded px-1.5 py-0.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-red-200"
            title="Delete section"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Section content */}
      <div style={{ pointerEvents: "none" }}>
        {section._type === "spacingSection" ? (
          <div
            className="flex items-center justify-center border border-dashed border-neutral-300 bg-neutral-50/50 text-xs text-neutral-400"
            style={{ height: (section as import("../../../../types").SpacingSection).height ?? 80 }}
          >
            Spacing · {(section as import("../../../../types").SpacingSection).height ?? 80}px
          </div>
        ) : isEmptySection(section) ? (
          <EmptyPlaceholder section={section} />
        ) : (
          renderSection(section)
        )}
      </div>
    </div>
  );
}

function renderSection(section: Section) {
  switch (section._type) {
    case "heroSection":
      return <HeroSectionComponent section={section} />;
    case "textSection":
      return <TextSectionComponent section={section} />;
    case "imageSection":
      return <ImageSectionComponent section={section} />;
    case "gallerySection":
      return <GallerySectionComponent section={section} />;
    case "videoSection":
      return <VideoSectionComponent section={section} />;
    case "splitSection":
      return <SplitSectionComponent section={section} />;
    case "spacingSection":
      return <SpacingSectionComponent section={section} />;
    default:
      return null;
  }
}
