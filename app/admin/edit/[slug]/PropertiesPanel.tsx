"use client";

import { useState } from "react";
import type {
  Project,
  Section,
  SanityImage,
  HeroSection,
  TextSection,
  ImageSection,
  GallerySection,
  VideoSection,
  SplitSection,
  SpacingSection,
  FreeObject,
  FreeImageObject,
  FreeVideoObject,
  FreeTextObject,
} from "../../../../types";
import { urlFor } from "../../../../lib/sanity";
import ImageUploadField from "./ImageUploadField";

type PropsPanelProps =
  | {
      section: Section;
      freeObject?: undefined;
      project?: undefined;
      onChange: (patch: Partial<Section>) => void;
      onClose: () => void;
    }
  | {
      section?: undefined;
      freeObject: FreeObject;
      project?: undefined;
      onChange: (patch: Partial<FreeObject>) => void;
      onClose: () => void;
    }
  | {
      section?: undefined;
      freeObject?: undefined;
      project: Project;
      onChange: (patch: Partial<Project>) => void;
      onClose: () => void;
    };

// Shared input components
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium tracking-wide text-neutral-500 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none"
    />
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 accent-blue-500"
      />
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={(e) => {
          let v = Number(e.target.value);
          if (min !== undefined) v = Math.max(min, v);
          if (max !== undefined) v = Math.min(max, v);
          onChange(v);
        }}
        className="w-16 rounded border border-neutral-200 bg-white px-2 py-1 text-right text-xs text-neutral-900 focus:border-neutral-400 focus:outline-none"
      />
    </div>
  );
}

function ToggleInput({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <div
        className={`relative h-5 w-9 rounded-full transition-colors ${value ? "bg-blue-500" : "bg-neutral-200"}`}
        onClick={() => onChange(!value)}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </div>
      <span className="text-sm text-neutral-700">{label}</span>
    </label>
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-neutral-100" />
    </div>
  );
}

// === Shared free position controls ===

function FreePositionControls({
  obj,
  onChange,
}: {
  obj: FreeObject;
  onChange: (patch: Partial<FreeObject>) => void;
}) {
  return (
    <>
      <SectionDivider label="Position" />

      <Field label={`X Position: ${obj.xPercent ?? 10}%`}>
        <NumberInput
          value={obj.xPercent ?? 10}
          onChange={(v) => onChange({ xPercent: v })}
          min={-50}
          max={150}
        />
      </Field>

      <Field label={`Y Position: ${obj.yPercent ?? 10}%`}>
        <NumberInput
          value={obj.yPercent ?? 10}
          onChange={(v) => onChange({ yPercent: v })}
          min={-50}
          max={150}
        />
      </Field>

      <Field label={`Width: ${obj.widthPercent ?? 40}%`}>
        <NumberInput
          value={obj.widthPercent ?? 40}
          onChange={(v) => onChange({ widthPercent: v })}
          min={5}
          max={200}
        />
      </Field>

      <Field label={`Z-Index: ${obj.zIndex ?? 10}`}>
        <NumberInput
          value={obj.zIndex ?? 10}
          onChange={(v) => onChange({ zIndex: v })}
          min={0}
          max={50}
        />
      </Field>

      <Field label={`Rotation: ${obj.rotation ?? 0}\u00B0`}>
        <NumberInput
          value={obj.rotation ?? 0}
          onChange={(v) => onChange({ rotation: v })}
          min={-180}
          max={180}
        />
      </Field>

      <Field label={`Opacity: ${Math.round((obj.opacity ?? 1) * 100)}%`}>
        <NumberInput
          value={obj.opacity ?? 1}
          onChange={(v) => onChange({ opacity: v })}
          min={0}
          max={1}
          step={0.05}
        />
      </Field>
    </>
  );
}

// === Per-type panels (sections) ===

function HeroPanel({
  section,
  onChange,
}: {
  section: HeroSection;
  onChange: (patch: Partial<HeroSection>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Heading">
        <TextInput
          value={section.heading ?? ""}
          onChange={(v) => onChange({ heading: v })}
          placeholder="Hero heading\u2026"
        />
      </Field>

      <Field label="Subheading">
        <TextInput
          value={section.subheading ?? ""}
          onChange={(v) => onChange({ subheading: v })}
          placeholder="Subheading\u2026"
        />
      </Field>

      <SectionDivider label="Layout" />

      <Field label="Minimum Height">
        <SelectInput
          value={section.minHeight ?? "60vh"}
          onChange={(v) => onChange({ minHeight: v as HeroSection["minHeight"] })}
          options={[
            { label: "40vh", value: "40vh" },
            { label: "60vh", value: "60vh" },
            { label: "80vh", value: "80vh" },
            { label: "100vh (full screen)", value: "100vh" },
          ]}
        />
      </Field>

      <Field label="Text Position">
        <SelectInput
          value={section.textPosition ?? "bottom"}
          onChange={(v) => onChange({ textPosition: v as HeroSection["textPosition"] })}
          options={[
            { label: "Top", value: "top" },
            { label: "Center", value: "center" },
            { label: "Bottom", value: "bottom" },
          ]}
        />
      </Field>

      <Field label="Text Alignment">
        <SelectInput
          value={section.textAlign ?? "left"}
          onChange={(v) => onChange({ textAlign: v as HeroSection["textAlign"] })}
          options={[
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ]}
        />
      </Field>

      <SectionDivider label="Background" />

      <ImageUploadField
        image={section.backgroundImage}
        onChange={(img) => onChange({ backgroundImage: img })}
        label="Background Image"
      />

      <SectionDivider label="Overlay" />

      <Field label={`Overlay Opacity: ${Math.round((section.overlayOpacity ?? 0.3) * 100)}%`}>
        <NumberInput
          value={section.overlayOpacity ?? 0.3}
          onChange={(v) => onChange({ overlayOpacity: v })}
          min={0}
          max={1}
          step={0.05}
        />
      </Field>
    </div>
  );
}

function TextPanel({
  section,
  onChange,
}: {
  section: TextSection;
  onChange: (patch: Partial<TextSection>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Max Width">
        <SelectInput
          value={section.maxWidth ?? "md"}
          onChange={(v) => onChange({ maxWidth: v as TextSection["maxWidth"] })}
          options={[
            { label: "Small (640px)", value: "sm" },
            { label: "Medium (768px)", value: "md" },
            { label: "Large (1024px)", value: "lg" },
            { label: "Extra Large (1280px)", value: "xl" },
            { label: "Full Width", value: "full" },
          ]}
        />
      </Field>

      <Field label="Text Alignment">
        <SelectInput
          value={section.textAlign ?? "left"}
          onChange={(v) => onChange({ textAlign: v as TextSection["textAlign"] })}
          options={[
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ]}
        />
      </Field>

      <Field label="Font Size">
        <SelectInput
          value={section.fontSize ?? "base"}
          onChange={(v) => onChange({ fontSize: v as TextSection["fontSize"] })}
          options={[
            { label: "Small", value: "sm" },
            { label: "Normal", value: "base" },
            { label: "Large", value: "lg" },
          ]}
        />
      </Field>

      <Field label="Line Height">
        <SelectInput
          value={section.lineHeight ?? "relaxed"}
          onChange={(v) => onChange({ lineHeight: v as TextSection["lineHeight"] })}
          options={[
            { label: "Tight", value: "tight" },
            { label: "Normal", value: "normal" },
            { label: "Relaxed", value: "relaxed" },
            { label: "Loose", value: "loose" },
          ]}
        />
      </Field>

      <Field label="Letter Spacing">
        <SelectInput
          value={section.letterSpacing ?? "normal"}
          onChange={(v) => onChange({ letterSpacing: v as TextSection["letterSpacing"] })}
          options={[
            { label: "Tighter", value: "tighter" },
            { label: "Tight", value: "tight" },
            { label: "Normal", value: "normal" },
            { label: "Wide", value: "wide" },
            { label: "Wider", value: "wider" },
          ]}
        />
      </Field>
    </div>
  );
}

function SpacingPanel({
  section,
  onChange,
}: {
  section: SpacingSection;
  onChange: (patch: Partial<SpacingSection>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label={`Height: ${section.height ?? 80}px`}>
        <NumberInput
          value={section.height ?? 80}
          onChange={(v) => onChange({ height: v })}
          min={0}
          max={500}
        />
      </Field>
    </div>
  );
}

function ImagePanel({
  section,
  onChange,
}: {
  section: ImageSection;
  onChange: (patch: Partial<ImageSection>) => void;
}) {
  return (
    <div className="space-y-4">
      <ImageUploadField image={section.image} onChange={(img) => onChange({ image: img })} />

      <Field label="Caption">
        <TextInput
          value={section.caption ?? ""}
          onChange={(v) => onChange({ caption: v })}
          placeholder="Image caption\u2026"
        />
      </Field>

      <SectionDivider label="Display" />

      <ToggleInput
        value={section.fullWidth ?? false}
        onChange={(v) => onChange({ fullWidth: v })}
        label="Full width"
      />

      <Field label="Aspect Ratio">
        <SelectInput
          value={section.aspectRatio ?? "16/10"}
          onChange={(v) => onChange({ aspectRatio: v })}
          options={[
            { label: "16:10", value: "16/10" },
            { label: "16:9 (Widescreen)", value: "16/9" },
            { label: "4:3", value: "4/3" },
            { label: "3:2", value: "3/2" },
            { label: "1:1 (Square)", value: "1/1" },
            { label: "21:9 (Ultrawide)", value: "21/9" },
          ]}
        />
      </Field>

      <Field label="Image Fit">
        <SelectInput
          value={section.objectFit ?? "cover"}
          onChange={(v) => onChange({ objectFit: v as ImageSection["objectFit"] })}
          options={[
            { label: "Cover (fill frame)", value: "cover" },
            { label: "Contain (show all)", value: "contain" },
            { label: "Fill (stretch)", value: "fill" },
          ]}
        />
      </Field>

      <Field label={`Border Radius: ${section.borderRadius ?? 2}px`}>
        <NumberInput
          value={section.borderRadius ?? 2}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>

      <SectionDivider label="Effects" />

      <ToggleInput
        value={section.grayscale ?? false}
        onChange={(v) => onChange({ grayscale: v })}
        label="Grayscale"
      />

      <Field label={`Opacity: ${Math.round((section.opacity ?? 1) * 100)}%`}>
        <NumberInput
          value={section.opacity ?? 1}
          onChange={(v) => onChange({ opacity: v })}
          min={0}
          max={1}
          step={0.05}
        />
      </Field>

      <Field label={`Rotation: ${section.rotation ?? 0}°`}>
        <NumberInput
          value={section.rotation ?? 0}
          onChange={(v) => onChange({ rotation: v })}
          min={-45}
          max={45}
        />
      </Field>
    </div>
  );
}

// Gallery images editor — add, remove, reorder (drag-and-drop + arrow buttons)
const GALLERY_DRAG_MIME = "application/x-gallery-image-key";

function GalleryImagesEditor({
  images,
  onChange,
}: {
  images: (SanityImage & { _key: string })[];
  onChange: (images: (SanityImage & { _key: string })[]) => void;
}) {
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [dropPlacement, setDropPlacement] = useState<"before" | "after">("before");

  const addImage = (img: SanityImage | undefined) => {
    if (!img) return;
    const withKey = { ...img, _key: `img-${Date.now()}` } as SanityImage & { _key: string };
    onChange([...images, withKey]);
  };

  const removeImage = (key: string) => {
    onChange(images.filter((i) => i._key !== key));
  };

  const moveImage = (key: string, dir: "up" | "down") => {
    const arr = [...images];
    const idx = arr.findIndex((i) => i._key === key);
    if (idx === -1) return;
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    onChange(arr);
  };

  const reorderByDrop = (sourceKey: string, targetKey: string, placement: "before" | "after") => {
    if (sourceKey === targetKey) return;
    const arr = [...images];
    const fromIdx = arr.findIndex((i) => i._key === sourceKey);
    if (fromIdx === -1) return;
    const [moved] = arr.splice(fromIdx, 1);
    let toIdx = arr.findIndex((i) => i._key === targetKey);
    if (toIdx === -1) {
      arr.push(moved);
    } else {
      if (placement === "after") toIdx += 1;
      arr.splice(toIdx, 0, moved);
    }
    onChange(arr);
  };

  return (
    <div className="space-y-2">
      {images.map((img, idx) => {
        let thumbUrl: string | null = null;
        try {
          thumbUrl = urlFor(img).width(120).auto("format").url();
        } catch {
          const asset = img.asset as { url?: string };
          thumbUrl = asset.url ?? null;
        }

        const isDraggedItem = draggingKey === img._key;
        const isDropTarget = dragOverKey === img._key && draggingKey !== img._key;

        return (
          <div
            key={img._key}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData(GALLERY_DRAG_MIME, img._key);
              e.dataTransfer.setData("text/plain", img._key);
              setDraggingKey(img._key);
            }}
            onDragEnd={() => {
              setDraggingKey(null);
              setDragOverKey(null);
            }}
            onDragOver={(e) => {
              if (!e.dataTransfer.types.includes(GALLERY_DRAG_MIME)) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              const rect = e.currentTarget.getBoundingClientRect();
              const midY = rect.top + rect.height / 2;
              setDragOverKey(img._key);
              setDropPlacement(e.clientY < midY ? "before" : "after");
            }}
            onDragLeave={(e) => {
              // Only clear if we're leaving the row itself, not crossing into a child
              if (e.currentTarget === e.target) {
                if (dragOverKey === img._key) setDragOverKey(null);
              }
            }}
            onDrop={(e) => {
              const sourceKey = e.dataTransfer.getData(GALLERY_DRAG_MIME);
              if (!sourceKey) return;
              e.preventDefault();
              reorderByDrop(sourceKey, img._key, dropPlacement);
              setDragOverKey(null);
              setDraggingKey(null);
            }}
            className={`relative flex items-center gap-2 rounded border p-1.5 transition-colors ${
              isDraggedItem
                ? "border-blue-300 opacity-40"
                : isDropTarget
                  ? "border-blue-400 bg-blue-50/40"
                  : "border-neutral-200"
            }`}
          >
            {isDropTarget && dropPlacement === "before" && (
              <div className="pointer-events-none absolute -top-[2px] right-0 left-0 h-[2px] bg-blue-500" />
            )}
            {isDropTarget && dropPlacement === "after" && (
              <div className="pointer-events-none absolute right-0 -bottom-[2px] left-0 h-[2px] bg-blue-500" />
            )}

            {/* Drag grip */}
            <span
              className="flex shrink-0 cursor-grab items-center text-neutral-400 active:cursor-grabbing"
              title="Drag to reorder"
              aria-hidden="true"
            >
              <svg viewBox="0 0 6 10" width="8" height="12" fill="currentColor">
                <circle cx="1" cy="1" r="1" />
                <circle cx="5" cy="1" r="1" />
                <circle cx="1" cy="5" r="1" />
                <circle cx="5" cy="5" r="1" />
                <circle cx="1" cy="9" r="1" />
                <circle cx="5" cy="9" r="1" />
              </svg>
            </span>

            <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-neutral-100">
              {thumbUrl ? (
                <img src={thumbUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[0.6rem] text-neutral-400">
                  No img
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <input
                type="text"
                value={img.alt ?? ""}
                onChange={(e) =>
                  onChange(
                    images.map((i) => (i._key === img._key ? { ...i, alt: e.target.value } : i)),
                  )
                }
                placeholder="Alt text (for accessibility)"
                className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-neutral-400 focus:outline-none"
              />
              <input
                type="text"
                value={img.caption ?? ""}
                onChange={(e) =>
                  onChange(
                    images.map((i) =>
                      i._key === img._key ? { ...i, caption: e.target.value } : i,
                    ),
                  )
                }
                placeholder="Caption (optional)"
                className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-neutral-400 focus:outline-none"
              />
            </div>
            <div className="flex shrink-0 flex-col items-center gap-0">
              <button
                onClick={() => moveImage(img._key, "up")}
                disabled={idx === 0}
                className="px-1 text-xs text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => moveImage(img._key, "down")}
                disabled={idx === images.length - 1}
                className="px-1 text-xs text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            <button
              onClick={() => removeImage(img._key)}
              className="shrink-0 px-1 text-xs text-neutral-400 hover:text-red-500"
              title="Remove"
            >
              ✕
            </button>
          </div>
        );
      })}
      <ImageUploadField onChange={(img) => addImage(img)} label="Add image" showAlt={false} />
    </div>
  );
}

function GalleryPanel({
  section,
  onChange,
}: {
  section: GallerySection;
  onChange: (patch: Partial<GallerySection>) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionDivider label="Images" />

      <GalleryImagesEditor
        images={section.images ?? []}
        onChange={(images) => onChange({ images })}
      />

      <Field label="Columns">
        <SelectInput
          value={String(section.columns ?? 2)}
          onChange={(v) => onChange({ columns: Number(v) as 2 | 3 })}
          options={[
            { label: "2 columns", value: "2" },
            { label: "3 columns", value: "3" },
          ]}
        />
      </Field>

      <Field label={`Gap: ${section.gap ?? 12}px`}>
        <NumberInput
          value={section.gap ?? 12}
          onChange={(v) => onChange({ gap: v })}
          min={0}
          max={64}
        />
      </Field>

      <Field label="Aspect Ratio">
        <SelectInput
          value={section.aspectRatio ?? "3/2"}
          onChange={(v) => onChange({ aspectRatio: v })}
          options={[
            { label: "3:2", value: "3/2" },
            { label: "4:3", value: "4/3" },
            { label: "1:1 (Square)", value: "1/1" },
            { label: "16:9", value: "16/9" },
          ]}
        />
      </Field>

      <Field label="Image Fit">
        <SelectInput
          value={section.objectFit ?? "cover"}
          onChange={(v) => onChange({ objectFit: v as GallerySection["objectFit"] })}
          options={[
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
          ]}
        />
      </Field>

      <Field label={`Border Radius: ${section.borderRadius ?? 2}px`}>
        <NumberInput
          value={section.borderRadius ?? 2}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>
    </div>
  );
}

function VideoPanel({
  section,
  onChange,
}: {
  section: VideoSection;
  onChange: (patch: Partial<VideoSection>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Vimeo URL">
        <TextInput
          value={section.vimeoUrl ?? ""}
          onChange={(v) => onChange({ vimeoUrl: v })}
          placeholder="https://vimeo.com/\u2026"
        />
      </Field>

      <Field label="Caption">
        <TextInput
          value={section.caption ?? ""}
          onChange={(v) => onChange({ caption: v })}
          placeholder="Video caption\u2026"
        />
      </Field>

      <SectionDivider label="Playback" />

      <ToggleInput
        value={section.loop ?? false}
        onChange={(v) => onChange({ loop: v })}
        label="Loop"
      />

      <ToggleInput
        value={section.autoplay ?? false}
        onChange={(v) => onChange({ autoplay: v })}
        label="Autoplay (muted)"
      />

      <SectionDivider label="Display" />

      <Field label="Aspect Ratio">
        <SelectInput
          value={section.aspectRatio ?? "16/9"}
          onChange={(v) => onChange({ aspectRatio: v })}
          options={[
            { label: "16:9 (Widescreen)", value: "16/9" },
            { label: "4:3", value: "4/3" },
            { label: "1:1 (Square)", value: "1/1" },
            { label: "9:16 (Vertical)", value: "9/16" },
          ]}
        />
      </Field>

      <Field label={`Border Radius: ${section.borderRadius ?? 2}px`}>
        <NumberInput
          value={section.borderRadius ?? 2}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>
    </div>
  );
}

function SplitPanel({
  section,
  onChange,
}: {
  section: SplitSection;
  onChange: (patch: Partial<SplitSection>) => void;
}) {
  return (
    <div className="space-y-4">
      <ImageUploadField image={section.image} onChange={(img) => onChange({ image: img })} />

      <Field label="Caption">
        <TextInput
          value={section.caption ?? ""}
          onChange={(v) => onChange({ caption: v })}
          placeholder="Image caption\u2026"
        />
      </Field>

      <SectionDivider label="Layout" />

      <Field label="Image Position">
        <SelectInput
          value={section.imagePosition ?? "left"}
          onChange={(v) => onChange({ imagePosition: v as SplitSection["imagePosition"] })}
          options={[
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ]}
        />
      </Field>

      <Field label="Vertical Alignment">
        <SelectInput
          value={section.verticalAlign ?? "center"}
          onChange={(v) => onChange({ verticalAlign: v as SplitSection["verticalAlign"] })}
          options={[
            { label: "Top", value: "start" },
            { label: "Center", value: "center" },
            { label: "Bottom", value: "end" },
          ]}
        />
      </Field>

      <Field label={`Column Gap: ${section.gap ?? 24}px`}>
        <NumberInput
          value={section.gap ?? 24}
          onChange={(v) => onChange({ gap: v })}
          min={0}
          max={120}
        />
      </Field>

      <SectionDivider label="Image" />

      <Field label="Aspect Ratio">
        <SelectInput
          value={section.imageAspectRatio ?? "4/3"}
          onChange={(v) => onChange({ imageAspectRatio: v })}
          options={[
            { label: "4:3", value: "4/3" },
            { label: "1:1 (Square)", value: "1/1" },
            { label: "3:2", value: "3/2" },
            { label: "16:9", value: "16/9" },
            { label: "3:4 (Portrait)", value: "3/4" },
          ]}
        />
      </Field>

      <Field label="Image Fit">
        <SelectInput
          value={section.objectFit ?? "cover"}
          onChange={(v) => onChange({ objectFit: v as SplitSection["objectFit"] })}
          options={[
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
          ]}
        />
      </Field>

      <Field label={`Border Radius: ${section.borderRadius ?? 2}px`}>
        <NumberInput
          value={section.borderRadius ?? 2}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>
    </div>
  );
}

// === Free object panels ===

function FreeImagePanel({
  obj,
  onChange,
}: {
  obj: FreeImageObject;
  onChange: (patch: Partial<FreeObject>) => void;
}) {
  return (
    <div className="space-y-4">
      <ImageUploadField
        image={obj.image}
        onChange={(img) => onChange({ image: img } as Partial<FreeObject>)}
      />

      <Field label={`Border Radius: ${obj.borderRadius ?? 0}px`}>
        <NumberInput
          value={obj.borderRadius ?? 0}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>

      <ToggleInput
        value={obj.grayscale ?? false}
        onChange={(v) => onChange({ grayscale: v })}
        label="Grayscale"
      />

      <FreePositionControls obj={obj} onChange={onChange} />
    </div>
  );
}

function FreeVideoPanel({
  obj,
  onChange,
}: {
  obj: FreeVideoObject;
  onChange: (patch: Partial<FreeObject>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Vimeo URL">
        <TextInput
          value={obj.vimeoUrl ?? ""}
          onChange={(v) => onChange({ vimeoUrl: v })}
          placeholder="https://vimeo.com/\u2026"
        />
      </Field>

      <SectionDivider label="Playback" />

      <ToggleInput value={obj.loop ?? false} onChange={(v) => onChange({ loop: v })} label="Loop" />

      <ToggleInput
        value={obj.autoplay ?? false}
        onChange={(v) => onChange({ autoplay: v })}
        label="Autoplay (muted)"
      />

      <SectionDivider label="Display" />

      <Field label="Aspect Ratio">
        <SelectInput
          value={obj.aspectRatio ?? "16/9"}
          onChange={(v) => onChange({ aspectRatio: v })}
          options={[
            { label: "16:9", value: "16/9" },
            { label: "4:3", value: "4/3" },
            { label: "1:1", value: "1/1" },
            { label: "9:16 (Vertical)", value: "9/16" },
          ]}
        />
      </Field>

      <Field label={`Border Radius: ${obj.borderRadius ?? 0}px`}>
        <NumberInput
          value={obj.borderRadius ?? 0}
          onChange={(v) => onChange({ borderRadius: v })}
          min={0}
          max={48}
        />
      </Field>

      <FreePositionControls obj={obj} onChange={onChange} />
    </div>
  );
}

function FreeTextPanel({
  obj,
  onChange,
}: {
  obj: FreeTextObject;
  onChange: (patch: Partial<FreeObject>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Font Size">
        <SelectInput
          value={obj.fontSize ?? "base"}
          onChange={(v) => onChange({ fontSize: v as FreeTextObject["fontSize"] })}
          options={[
            { label: "Small", value: "sm" },
            { label: "Normal", value: "base" },
            { label: "Large", value: "lg" },
            { label: "XL", value: "xl" },
          ]}
        />
      </Field>

      <Field label="Text Alignment">
        <SelectInput
          value={obj.textAlign ?? "left"}
          onChange={(v) => onChange({ textAlign: v as FreeTextObject["textAlign"] })}
          options={[
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ]}
        />
      </Field>

      <Field label="Text Color">
        <TextInput
          value={obj.color ?? "#171717"}
          onChange={(v) => onChange({ color: v })}
          placeholder="#171717"
        />
      </Field>

      <FreePositionControls obj={obj} onChange={onChange} />
    </div>
  );
}

// === Page Settings panel ===

function PageSettingsPanel({
  project,
  onChange,
}: {
  project: Project;
  onChange: (patch: Partial<Project>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Title">
        <TextInput
          value={project.title}
          onChange={(v) => onChange({ title: v })}
          placeholder="Project title…"
        />
      </Field>

      <Field label="Meta Description">
        <textarea
          value={project.meta_description ?? ""}
          onChange={(e) => onChange({ meta_description: e.target.value })}
          placeholder="SEO description…"
          rows={3}
          className="w-full resize-none rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none"
        />
      </Field>

      <SectionDivider label="Cover Image" />

      <ImageUploadField
        image={project.cover_image}
        onChange={(img) => onChange({ cover_image: img })}
        label="Cover"
      />

      <SectionDivider label="Social preview (OG image)" />

      <ImageUploadField
        image={project.og_image}
        onChange={(img) => onChange({ og_image: img })}
        label="OG image (1200×630 recommended)"
      />
      <p className="-mt-2 text-xs text-neutral-400">Falls back to the cover image when empty.</p>

      <SectionDivider label="Taxonomy" />

      <Field label="Category">
        <TextInput
          value={project.category ?? ""}
          onChange={(v) => onChange({ category: v })}
          placeholder="e.g. Film, Design…"
        />
      </Field>

      <Field label="Tags (comma-separated)">
        <TextInput
          value={(project.tags ?? []).join(", ")}
          onChange={(v) =>
            onChange({
              tags: v
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          placeholder="tag1, tag2…"
        />
      </Field>

      <SectionDivider label="Display" />

      <Field label="Sidebar Mode">
        <SelectInput
          value={project.sidebarMode ?? "auto"}
          onChange={(v) => onChange({ sidebarMode: v as Project["sidebarMode"] })}
          options={[
            { label: "Auto (show sidebar)", value: "auto" },
            { label: "Hidden (minimal)", value: "hidden" },
          ]}
        />
      </Field>

      <SectionDivider label="Home page" />

      <ToggleInput
        value={project.isSelectedOnHome ?? false}
        onChange={(v) => onChange({ isSelectedOnHome: v })}
        label="Show on home page"
      />
      <p className="-mt-2 text-xs text-neutral-400">
        Only projects flagged here appear in the Selected Work list. Reorder them from the Home page
        editor.
      </p>
    </div>
  );
}

// === Main panel ===

export default function PropertiesPanel(props: PropsPanelProps) {
  const { onClose, onChange } = props;

  const typeLabels: Record<string, string> = {
    heroSection: "Hero",
    textSection: "Text",
    imageSection: "Image",
    gallerySection: "Gallery",
    videoSection: "Video",
    splitSection: "Split",
    spacingSection: "Spacing",
    freeImageObject: "Free Image",
    freeVideoObject: "Free Video",
    freeTextObject: "Free Text",
  };

  const itemType = props.section?._type ?? props.freeObject?._type ?? "";
  const panelTitle = props.project ? "Page Settings" : (typeLabels[itemType] ?? itemType);

  function renderPanel() {
    if (props.project) {
      return (
        <PageSettingsPanel
          project={props.project}
          onChange={onChange as (patch: Partial<Project>) => void}
        />
      );
    }

    if (props.section) {
      const section = props.section;
      const sectionOnChange = onChange as (patch: Partial<Section>) => void;
      switch (section._type) {
        case "heroSection":
          return (
            <HeroPanel section={section} onChange={(p) => sectionOnChange(p as Partial<Section>)} />
          );
        case "textSection":
          return (
            <TextPanel section={section} onChange={(p) => sectionOnChange(p as Partial<Section>)} />
          );
        case "imageSection":
          return (
            <ImagePanel
              section={section}
              onChange={(p) => sectionOnChange(p as Partial<Section>)}
            />
          );
        case "gallerySection":
          return (
            <GalleryPanel
              section={section}
              onChange={(p) => sectionOnChange(p as Partial<Section>)}
            />
          );
        case "videoSection":
          return (
            <VideoPanel
              section={section}
              onChange={(p) => sectionOnChange(p as Partial<Section>)}
            />
          );
        case "splitSection":
          return (
            <SplitPanel
              section={section}
              onChange={(p) => sectionOnChange(p as Partial<Section>)}
            />
          );
        case "spacingSection":
          return (
            <SpacingPanel
              section={section}
              onChange={(p) => sectionOnChange(p as Partial<Section>)}
            />
          );
        default:
          return <p className="text-sm text-neutral-400">No properties available.</p>;
      }
    }

    if (props.freeObject) {
      const obj = props.freeObject;
      const freeOnChange = onChange as (patch: Partial<FreeObject>) => void;
      switch (obj._type) {
        case "freeImageObject":
          return <FreeImagePanel obj={obj} onChange={freeOnChange} />;
        case "freeVideoObject":
          return <FreeVideoPanel obj={obj} onChange={freeOnChange} />;
        case "freeTextObject":
          return <FreeTextPanel obj={obj} onChange={freeOnChange} />;
        default:
          return <p className="text-sm text-neutral-400">No properties available.</p>;
      }
    }

    return null;
  }

  return (
    <div className="flex h-full w-80 shrink-0 flex-col overflow-hidden border-l border-neutral-200 bg-white shadow-2xl">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <div>
          <span className="text-xs tracking-wide text-neutral-400 uppercase">Properties</span>
          <h3 className="text-sm font-semibold text-neutral-900">{panelTitle}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-lg leading-none text-neutral-400 hover:text-neutral-700"
          aria-label="Close properties"
        >
          ✕
        </button>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">{renderPanel()}</div>

      {/* Footer hint */}
      <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3">
        <p className="text-xs text-neutral-400">
          Changes preview instantly. <span className="font-medium">Save draft</span> or{" "}
          <span className="font-medium">publish</span> to apply.
        </p>
      </div>
    </div>
  );
}
