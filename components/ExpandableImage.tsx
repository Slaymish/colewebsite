"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ExpandableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: import("react").CSSProperties;
  sizes: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

export default function ExpandableImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  sizes,
  placeholder,
  blurDataURL,
  loading,
  priority,
}: ExpandableImageProps) {
  const [open, setOpen] = useState(false);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block w-full cursor-zoom-in text-left"
        aria-label={`View larger: ${alt || "image"}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          style={style}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          loading={loading}
          priority={priority}
        />
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/92 p-4 md:p-10"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="relative max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={alt || "Fullscreen image"}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="max-h-[85vh] w-auto max-w-full object-contain"
              sizes="100vw"
              priority
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -right-1 -top-10 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20 md:-right-2 md:-top-12"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
