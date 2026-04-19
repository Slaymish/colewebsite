"use client";

import React, { useRef, useCallback } from "react";
import Image from "next/image";
import type {
  FreeObject,
  FreeImageObject,
  FreeVideoObject,
  FreeTextObject,
} from "../../../../types";
import { urlFor } from "../../../../lib/sanity";
import { renderBlock } from "../../../../lib/renderBlock";
import { getVimeoId, buildVimeoEmbedUrl } from "../../../../lib/vimeo";

const fontSizeMap: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

// --- Content renderers — no positioning wrapper, matches public page visuals ---

function ImageContent({ obj }: { obj: FreeImageObject }) {
  if (!obj.image?.asset) {
    return (
      <div className="flex h-24 w-full items-center justify-center bg-neutral-200 text-xs text-neutral-400">
        No image
      </div>
    );
  }
  const imageUrl = urlFor(obj.image).width(1400).auto("format").url();
  const thumbUrl = urlFor(obj.image).width(40).blur(10).url();
  return (
    <Image
      src={imageUrl}
      alt={obj.image.alt ?? ""}
      width={1400}
      height={875}
      className="block h-auto w-full"
      style={{
        borderRadius: obj.borderRadius ?? 0,
        filter: obj.grayscale ? "grayscale(1)" : undefined,
      }}
      placeholder={thumbUrl ? "blur" : "empty"}
      blurDataURL={thumbUrl}
      sizes="100vw"
      draggable={false}
    />
  );
}

function VideoContent({ obj }: { obj: FreeVideoObject }) {
  const aspectRatio = obj.aspectRatio ?? "16/9";
  const borderRadius = obj.borderRadius ?? 0;

  if (!obj.vimeoUrl) {
    return (
      <div
        className="flex w-full items-center justify-center bg-neutral-900 text-xs text-neutral-400"
        style={{ aspectRatio, borderRadius }}
      >
        No URL
      </div>
    );
  }

  const videoId = getVimeoId(obj.vimeoUrl);
  if (!videoId) {
    return (
      <div
        className="flex w-full items-center justify-center bg-neutral-900 text-xs text-neutral-400"
        style={{ aspectRatio, borderRadius }}
      >
        Invalid Vimeo URL
      </div>
    );
  }

  const embedUrl = buildVimeoEmbedUrl(videoId, {
    autoplay: obj.autoplay,
    loop: obj.loop,
  });

  return (
    <div className="overflow-hidden bg-neutral-900" style={{ aspectRatio, borderRadius }}>
      <iframe
        src={embedUrl}
        title="Video"
        className="h-full w-full"
        width="100%"
        height="100%"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function TextContent({ obj }: { obj: FreeTextObject }) {
  if (!obj.content?.length) {
    return <div className="text-sm text-neutral-400 italic">No text content</div>;
  }
  const fontSize = fontSizeMap[obj.fontSize ?? "base"] ?? "text-base";
  return (
    <div
      className={`${fontSize} space-y-2`}
      style={{
        color: obj.color ?? "#171717",
        textAlign: (obj.textAlign as React.CSSProperties["textAlign"]) ?? "left",
      }}
    >
      {obj.content.map((block) => renderBlock(block, { variant: "compact" }))}
    </div>
  );
}

// --- Drag types ---

type DragType = "move" | "resize-br" | "resize-bl" | "resize-tr" | "resize-tl";

function freeObjectLabel(type: string): string {
  const labels: Record<string, string> = {
    freeImageObject: "Free Image",
    freeVideoObject: "Free Video",
    freeTextObject: "Free Text",
  };
  return labels[type] ?? type;
}

// --- Main component ---

interface EditableFreeObjectProps {
  obj: FreeObject;
  isSelected: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onChange: (patch: Partial<FreeObject>) => void;
  onExpandCanvas?: (newMinHeight: number) => void;
}

export default function EditableFreeObject({
  obj,
  isSelected,
  canvasRef,
  onSelect,
  onDelete,
  onChange,
  onExpandCanvas,
}: EditableFreeObjectProps) {
  const xPercent = obj.xPercent ?? 10;
  const yPercent = obj.yPercent ?? 10;
  const widthPercent = obj.widthPercent ?? 40;
  const rotation = obj.rotation ?? 0;
  const opacity = obj.opacity ?? 1;
  const zIndex = obj.zIndex ?? 10;

  const dragState = useRef<{
    type: DragType;
    startX: number;
    startY: number;
    startXPct: number;
    startYPct: number;
    startWPct: number;
  } | null>(null);

  const startInteraction = useCallback(
    (e: React.MouseEvent, type: DragType) => {
      e.preventDefault();
      e.stopPropagation();

      dragState.current = {
        type,
        startX: e.clientX,
        startY: e.clientY,
        startXPct: xPercent,
        startYPct: yPercent,
        startWPct: widthPercent,
      };

      const onMouseMove = (me: MouseEvent) => {
        if (!dragState.current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const dx = ((me.clientX - dragState.current.startX) / rect.width) * 100;
        const dy = ((me.clientY - dragState.current.startY) / rect.height) * 100;

        if (dragState.current.type === "move") {
          const newYPct = dragState.current.startYPct + dy;
          onChange({
            xPercent: Math.round(dragState.current.startXPct + dx),
            yPercent: Math.round(newYPct),
          });

          // Auto-expand canvas if dragging near the bottom edge
          if (onExpandCanvas) {
            const canvasCurrentHeight = canvasRef.current.offsetHeight;
            const objectTopPx = (newYPct / 100) * canvasCurrentHeight;
            const EXPAND_THRESHOLD = 100; // px from bottom to trigger expand
            const EXPAND_AMOUNT = 200; // px to add each time
            if (objectTopPx > canvasCurrentHeight - EXPAND_THRESHOLD) {
              onExpandCanvas(canvasCurrentHeight + EXPAND_AMOUNT);
            }
          }
        } else {
          const sign = dragState.current.type.endsWith("r") ? 1 : -1;
          const newW = Math.max(10, dragState.current.startWPct + dx * sign);
          onChange({ widthPercent: Math.round(newW) });
        }
      };

      const onMouseUp = () => {
        dragState.current = null;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [xPercent, yPercent, widthPercent, onChange, canvasRef, onExpandCanvas],
  );

  const handleStyle: React.CSSProperties = {
    position: "absolute",
    width: 14,
    height: 14,
    background: "white",
    border: "2px solid #3b82f6",
    borderRadius: 3,
    zIndex: 10,
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        width: `${widthPercent}%`,
        zIndex,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        opacity,
        cursor: isSelected ? "move" : "pointer",
        userSelect: "none",
      }}
      onClick={onSelect}
      onMouseDown={isSelected ? (e) => startInteraction(e, "move") : undefined}
    >
      {/* Actual content — identical rendering to the public page */}
      {obj._type === "freeImageObject" && <ImageContent obj={obj as FreeImageObject} />}
      {obj._type === "freeVideoObject" && <VideoContent obj={obj as FreeVideoObject} />}
      {obj._type === "freeTextObject" && <TextContent obj={obj as FreeTextObject} />}

      {/* Editor chrome — only visible when selected */}
      {isSelected && (
        <>
          {/* Blue outline */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              outline: "2px solid #3b82f6",
              outlineOffset: 2,
              pointerEvents: "none",
            }}
          />

          {/* Type label + delete button */}
          <div
            style={{
              position: "absolute",
              top: -26,
              left: 0,
              background: "rgba(59,130,246,0.9)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: "3px 3px 0 0",
              whiteSpace: "nowrap",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ color: "white", fontSize: 11, fontWeight: 600 }}>
              {freeObjectLabel(obj._type)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete this ${freeObjectLabel(obj._type)}?`)) {
                  onDelete();
                }
              }}
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 14,
                padding: "0 4px",
                cursor: "pointer",
                lineHeight: 1,
              }}
              title="Delete"
            >
              ×
            </button>
          </div>

          {/* Resize handles */}
          <div
            style={{ ...handleStyle, bottom: -6, right: -6, cursor: "se-resize" }}
            onMouseDown={(e) => startInteraction(e, "resize-br")}
          />
          <div
            style={{ ...handleStyle, bottom: -6, left: -6, cursor: "sw-resize" }}
            onMouseDown={(e) => startInteraction(e, "resize-bl")}
          />
          <div
            style={{ ...handleStyle, top: -6, right: -6, cursor: "ne-resize" }}
            onMouseDown={(e) => startInteraction(e, "resize-tr")}
          />
          <div
            style={{ ...handleStyle, top: -6, left: -6, cursor: "nw-resize" }}
            onMouseDown={(e) => startInteraction(e, "resize-tl")}
          />
        </>
      )}
    </div>
  );
}
