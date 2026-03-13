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

interface EditableFreeObjectProps {
  obj: FreeObject;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onChange: (patch: Partial<FreeObject>) => void;
}

function freeObjectLabel(type: string): string {
  const labels: Record<string, string> = {
    freeImageObject: "Free Image",
    freeVideoObject: "Free Video",
    freeTextObject: "Free Text",
  };
  return labels[type] ?? type;
}

type DragType = "move" | "resize-br" | "resize-bl" | "resize-tr" | "resize-tl";

function DraggableOverlay({
  obj,
  onChange,
  containerRef,
  children,
}: {
  obj: FreeObject;
  onChange: (patch: Partial<FreeObject>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}) {
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
        if (!dragState.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const dx =
          ((me.clientX - dragState.current.startX) / rect.width) * 100;
        const dy =
          ((me.clientY - dragState.current.startY) / rect.height) * 100;

        if (dragState.current.type === "move") {
          onChange({
            xPercent: Math.round(dragState.current.startXPct + dx),
            yPercent: Math.round(dragState.current.startYPct + dy),
          });
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
    [xPercent, yPercent, widthPercent, onChange, containerRef],
  );

  const handleStyle: React.CSSProperties = {
    position: "absolute",
    width: 14,
    height: 14,
    background: "white",
    border: "2px solid #3b82f6",
    borderRadius: 3,
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
        cursor: "move",
        userSelect: "none",
      }}
      onMouseDown={(e) => startInteraction(e, "move")}
    >
      {children}

      {/* Resize handles */}
      <div
        style={{
          ...handleStyle,
          bottom: -6,
          right: -6,
          cursor: "se-resize",
          zIndex: 10,
        }}
        onMouseDown={(e) => startInteraction(e, "resize-br")}
      />
      <div
        style={{
          ...handleStyle,
          bottom: -6,
          left: -6,
          cursor: "sw-resize",
          zIndex: 10,
        }}
        onMouseDown={(e) => startInteraction(e, "resize-bl")}
      />
      <div
        style={{
          ...handleStyle,
          top: -6,
          right: -6,
          cursor: "ne-resize",
          zIndex: 10,
        }}
        onMouseDown={(e) => startInteraction(e, "resize-tr")}
      />
      <div
        style={{
          ...handleStyle,
          top: -6,
          left: -6,
          cursor: "nw-resize",
          zIndex: 10,
        }}
        onMouseDown={(e) => startInteraction(e, "resize-tl")}
      />

      {/* Move hint */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(59,130,246,0.85)",
          color: "white",
          fontSize: 11,
          padding: "3px 8px",
          borderRadius: 4,
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        drag to move
      </div>

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
    </div>
  );
}

function FreeImagePreview({ obj }: { obj: FreeImageObject }) {
  if (!obj.image?.asset?._ref) {
    return (
      <div className="w-full h-24 bg-neutral-200 flex items-center justify-center text-xs text-neutral-400">
        No image
      </div>
    );
  }
  const imageUrl = urlFor(obj.image).width(800).auto("format").url();
  const thumbUrl = urlFor(obj.image).width(40).blur(10).url();
  return (
    <Image
      src={imageUrl}
      alt={obj.image.alt ?? ""}
      width={800}
      height={500}
      className="w-full h-auto block"
      style={{
        borderRadius: obj.borderRadius ?? 0,
        filter: obj.grayscale ? "grayscale(1)" : undefined,
      }}
      placeholder={thumbUrl ? "blur" : "empty"}
      blurDataURL={thumbUrl}
      draggable={false}
    />
  );
}

function FreeVideoPreview({ obj }: { obj: FreeVideoObject }) {
  return (
    <div
      className="w-full bg-neutral-900 flex items-center justify-center text-neutral-400 text-xs"
      style={{
        aspectRatio: obj.aspectRatio ?? "16/9",
        borderRadius: obj.borderRadius ?? 0,
      }}
    >
      Video: {obj.vimeoUrl || "No URL"}
    </div>
  );
}

function FreeTextPreview({ obj }: { obj: FreeTextObject }) {
  const hasContent = obj.content && obj.content.length > 0;
  const preview = hasContent
    ? obj.content!
        .map((b) => b.children.map((c) => c.text).join(""))
        .join(" ")
        .slice(0, 100)
    : "No text content";

  return (
    <div
      className="p-3 bg-white/80 border border-dashed border-neutral-300 rounded text-sm"
      style={{
        color: obj.color ?? "#171717",
        textAlign: (obj.textAlign as React.CSSProperties["textAlign"]) ?? "left",
      }}
    >
      {preview}
    </div>
  );
}

export default function EditableFreeObject({
  obj,
  isSelected,
  onSelect,
  onDelete,
  onChange,
}: EditableFreeObjectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`relative ${isSelected ? "" : ""}`}
      style={{ minHeight: 60 }}
      onClick={onSelect}
    >
      {/* Type label + delete button */}
      {isSelected && (
        <div
          className="absolute top-0 left-0 z-50 flex items-center gap-2 px-2 py-1"
          style={{ background: "rgba(59,130,246,0.9)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-white text-xs font-medium px-1">
            {freeObjectLabel(obj._type)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete this ${freeObjectLabel(obj._type)}?`)) {
                onDelete();
              }
            }}
            className="text-white/80 hover:text-red-200 text-sm px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
            title="Delete"
          >
            x
          </button>
        </div>
      )}

      <DraggableOverlay
        obj={obj}
        onChange={(patch) => onChange(patch as Partial<FreeObject>)}
        containerRef={containerRef as React.RefObject<HTMLDivElement>}
      >
        {obj._type === "freeImageObject" && (
          <FreeImagePreview obj={obj as FreeImageObject} />
        )}
        {obj._type === "freeVideoObject" && (
          <FreeVideoPreview obj={obj as FreeVideoObject} />
        )}
        {obj._type === "freeTextObject" && (
          <FreeTextPreview obj={obj as FreeTextObject} />
        )}
      </DraggableOverlay>
    </div>
  );
}
