"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import type { SanityImage } from "../../../../types";
import { urlFor } from "../../../../lib/sanity";

interface ImageUploadFieldProps {
  image?: SanityImage;
  onChange: (image: SanityImage | undefined) => void;
  label?: string;
  /** Show alt text input */
  showAlt?: boolean;
}

export default function ImageUploadField({
  image,
  onChange,
  label = "Image",
  showAlt = true,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [hotspotEditing, setHotspotEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hotspot = image?.hotspot;

  const setHotspot = (x: number, y: number) => {
    if (!image) return;
    onChange({
      ...image,
      // Sanity's hotspot format: x/y are the focal point (0-1), width/height
      // describe a focal region. We keep w/h at 1 so urlFor treats the whole
      // image as the focal region with a focal point at x,y.
      hotspot: { x, y, width: 1, height: 1 },
    });
  };

  const thumbUrl = image?.asset
    ? (() => {
        try {
          return urlFor(image).width(400).auto("format").url();
        } catch {
          // Freshly uploaded asset may only have url directly
          const asset = image.asset as { url?: string };
          return asset.url ?? null;
        }
      })()
    : null;

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }
        const asset = await res.json();
        onChange({
          _type: "image",
          asset: { _id: asset._id, _type: "reference", _ref: asset._ref, url: asset.url },
          alt: image?.alt,
        } as SanityImage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange, image?.alt],
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
    },
    [upload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) upload(file);
    },
    [upload],
  );

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium tracking-wide text-neutral-500 uppercase">
        {label}
      </label>

      {/* Drop zone / preview */}
      <div
        className={`relative overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : thumbUrl
              ? "border-neutral-200 bg-neutral-50"
              : "border-neutral-300 bg-neutral-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {thumbUrl ? (
          <div className="relative">
            <Image
              src={thumbUrl}
              alt={image?.alt ?? ""}
              width={400}
              height={250}
              className="h-auto w-full object-cover"
              sizes="300px"
            />

            {/* Hotspot editor overlay — click anywhere on the image to set
                the focal point. Active only while `hotspotEditing` is true. */}
            {hotspotEditing && (
              <button
                type="button"
                aria-label="Click to set focal point"
                className="absolute inset-0 cursor-crosshair bg-black/10"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  setHotspot(Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y)));
                }}
              />
            )}

            {/* Existing focal point indicator (always visible when set) */}
            {hotspot && (
              <div
                className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 shadow"
                style={{
                  left: `${(hotspot.x ?? 0.5) * 100}%`,
                  top: `${(hotspot.y ?? 0.5) * 100}%`,
                }}
                aria-hidden="true"
              />
            )}

            {!hotspotEditing && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow hover:bg-neutral-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => setHotspotEditing(true)}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow hover:bg-neutral-50"
                >
                  {hotspot ? "Move focus" : "Set focus"}
                </button>
                <button
                  type="button"
                  onClick={() => onChange(undefined)}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Exit hotspot editing — shown above the image */}
            {hotspotEditing && (
              <div className="absolute top-2 right-2 flex items-center gap-2">
                {hotspot && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!image) return;
                      const rest = { ...image };
                      delete (rest as { hotspot?: unknown }).hotspot;
                      onChange(rest);
                    }}
                    className="rounded-md bg-white px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-red-50"
                  >
                    Clear focus
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setHotspotEditing(false)}
                  className="rounded-md bg-white px-2 py-1 text-xs font-medium text-neutral-700 shadow hover:bg-neutral-50"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center gap-1.5 px-4 py-6 text-center"
          >
            {uploading ? (
              <span className="text-xs text-neutral-500">Uploading…</span>
            ) : (
              <>
                <span className="text-lg text-neutral-400">+</span>
                <span className="text-xs text-neutral-500">Click or drop image</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {/* Alt text */}
      {showAlt && image?.asset && (
        <input
          type="text"
          value={image.alt ?? ""}
          onChange={(e) => onChange({ ...image, alt: e.target.value })}
          placeholder="Alt text…"
          className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none"
        />
      )}
    </div>
  );
}
