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
  const inputRef = useRef<HTMLInputElement>(null);

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
                onClick={() => onChange(undefined)}
                className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow hover:bg-red-50"
              >
                Remove
              </button>
            </div>
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
