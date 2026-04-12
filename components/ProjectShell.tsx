"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import type { ProjectSummary, SiteSettings } from "../types";
import { urlFor } from "../lib/sanity";
import Header from "./Header";

interface ProjectShellProps {
  settings: SiteSettings | null;
  projects: ProjectSummary[];
  activeSlug: string;
  children: React.ReactNode;
}

const SCROLL_THRESHOLD = 120;

export default function ProjectShell({
  settings,
  projects,
  activeSlug,
  children,
}: ProjectShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  const name = settings?.name ?? "Cole Anderson";
  const logoUrl =
    settings?.logo?.asset && "_id" in settings.logo.asset
      ? urlFor(settings.logo).width(128).height(128).auto("format").url()
      : null;
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onScroll = useCallback(() => {
    if (manualOverride !== null) return;
    setCollapsed(window.scrollY > SCROLL_THRESHOLD);
  }, [manualOverride]);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    if (manualOverride !== false) return;
    const handleScroll = () => {
      if (window.scrollY <= SCROLL_THRESHOLD) {
        setManualOverride(null);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [manualOverride]);

  const isCollapsed = manualOverride ?? collapsed;

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar column — animated width */}
      <motion.div
        className="hidden md:flex md:sticky md:top-0 md:h-screen md:shrink-0 md:border-r md:border-black/10 md:overflow-hidden"
        animate={{ width: isCollapsed ? 56 : "min(22vw, 280px)" }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isCollapsed ? (
            <motion.div
              key="rail"
              className="flex w-14 flex-col items-center py-5 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => {
                  setManualOverride(false);
                  setCollapsed(false);
                }}
                aria-label="Open sidebar"
                className="flex flex-col items-center gap-1 group"
              >
                {logoUrl ? (
                  <span className="relative h-9 w-9 overflow-hidden rounded-full border border-black/10 bg-white group-hover:border-black/25 transition-colors">
                    <Image
                      src={logoUrl}
                      alt={name}
                      width={72}
                      height={72}
                      className="h-full w-full object-cover"
                    />
                  </span>
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] text-[0.65rem] font-semibold text-neutral-700 group-hover:border-black/30 transition-colors">
                    {initials || "—"}
                  </span>
                )}
                <span className="text-[0.6rem] text-black/35 group-hover:text-black/60 transition-colors">
                  menu
                </span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="full"
              className="flex-1 min-w-0 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Header
                settings={settings}
                projects={projects}
                activeSlug={activeSlug}
              />
              <button
                onClick={() => {
                  setManualOverride(true);
                  setCollapsed(true);
                }}
                aria-label="Collapse sidebar"
                className="absolute top-3 right-3 flex items-center gap-1 rounded px-1.5 py-1 text-[0.72rem] text-black/35 hover:text-black/70 hover:bg-black/5 transition-colors"
                title="Hide sidebar"
              >
                ←
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile: always show full header */}
      <div className="md:hidden">
        <Header
          settings={settings}
          projects={projects}
          activeSlug={activeSlug}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
