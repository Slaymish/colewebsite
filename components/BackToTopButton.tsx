"use client";

import { useCallback, useEffect, useState } from "react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(() =>
    typeof globalThis.window !== "undefined" ? globalThis.window.scrollY > 360 : false,
  );

  const onScroll = useCallback(() => {
    setVisible(globalThis.window.scrollY > 360);
  }, []);

  useEffect(() => {
    globalThis.window.addEventListener("scroll", onScroll, { passive: true });
    return () => globalThis.window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => globalThis.window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-5 bottom-6 z-40 flex h-10 w-10 items-center justify-center border border-black bg-white text-black transition-colors duration-100 hover:bg-black hover:text-white md:right-8 md:bottom-8"
      aria-label="Back to top"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
