"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

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
  galleryImages?: GalleryImage[];
  galleryIndex?: number;
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
  galleryImages,
  galleryIndex = 0,
}: ExpandableImageProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(galleryIndex);
  const [thumbRect, setThumbRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const hasGallery = galleryImages && galleryImages.length > 1;

  const currentImage = hasGallery ? galleryImages[currentIndex] : { src, alt, width, height };

  const handleOpen = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    if (buttonRef.current) {
      setThumbRect(buttonRef.current.getBoundingClientRect());
    }
    setCurrentIndex(galleryIndex);
    setOpen(true);
  }, [galleryIndex]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setThumbRect(null);
    previousFocusRef.current?.focus();
  }, []);

  const handlePrev = useCallback(() => {
    if (!hasGallery) return;
    setCurrentIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  }, [hasGallery, galleryImages]);

  const handleNext = useCallback(() => {
    if (!hasGallery) return;
    setCurrentIndex((i) => (i + 1) % galleryImages.length);
  }, [hasGallery, galleryImages]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (hasGallery && e.key === "ArrowLeft") handlePrev();
      if (hasGallery && e.key === "ArrowRight") handleNext();
    },
    [handleClose, hasGallery, handlePrev, handleNext],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the close button when modal opens
    const dialog = dialogRef.current;
    if (dialog) {
      const closeBtn = dialog.querySelector<HTMLButtonElement>("button");
      closeBtn?.focus();
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  // Trap focus within the modal
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleFocusTrap(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = dialog!.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleFocusTrap);
    return () => document.removeEventListener("keydown", handleFocusTrap);
  }, [open]);

  const getInitialTransform = () => {
    if (!thumbRect) return { opacity: 0, scale: 0.8 };
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const centerX = viewportW / 2;
    const centerY = viewportH / 2;
    const thumbCenterX = thumbRect.left + thumbRect.width / 2;
    const thumbCenterY = thumbRect.top + thumbRect.height / 2;
    const translateX = thumbCenterX - centerX;
    const translateY = thumbCenterY - centerY;
    const imgAspect = currentImage.width / currentImage.height;
    const maxW = viewportW * 0.85;
    const maxH = viewportH * 0.85;
    let fitW: number, fitH: number;
    if (maxW / maxH > imgAspect) {
      fitH = maxH;
      fitW = fitH * imgAspect;
    } else {
      fitW = maxW;
      fitH = fitW / imgAspect;
    }
    const scaleX = thumbRect.width / fitW;
    const scaleY = thumbRect.height / fitH;
    const scale = Math.min(scaleX, scaleY);
    return { x: translateX, y: translateY, scale };
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
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

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dialogRef}
            className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/92 p-4 md:p-10"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label={currentImage.alt || "Fullscreen image"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="relative flex max-h-[85vh] max-w-[85vw] items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              initial={getInitialTransform()}
              animate={{ x: 0, y: 0, scale: 1 }}
              exit={getInitialTransform()}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                width={currentImage.width}
                height={currentImage.height}
                className="max-h-[85vh] w-auto max-w-full object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>

            {/* Close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
            >
              Close
            </button>

            {/* Gallery controls */}
            {hasGallery && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                  aria-label="Previous image"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4l-6 6 6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                  aria-label="Next image"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 4l6 6-6 6" />
                  </svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                  {currentIndex + 1} / {galleryImages.length}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
