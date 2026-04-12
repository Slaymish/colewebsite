"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(() => {
    setVisible(window.scrollY > 360);
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            const target = document.getElementById("main-content") ?? document.body;
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
          }}
          className="fixed bottom-6 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white/90 text-neutral-800 shadow-sm backdrop-blur-sm transition hover:bg-white md:bottom-8 md:right-8"
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
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
        </motion.button>
      )}
    </AnimatePresence>
  );
}
