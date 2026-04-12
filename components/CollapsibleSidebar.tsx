"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProjectSummary, SiteSettings } from "../types";
import { urlFor } from "../lib/sanity";
import Header from "./Header";

interface CollapsibleSidebarProps {
  settings: SiteSettings | null;
  projects: ProjectSummary[];
  activeSlug: string;
  /** When true the sidebar starts collapsed (hidden mode). */
  startCollapsed?: boolean;
  children: React.ReactNode;
}

/**
 * Wraps a project page in the standard sidebar + main layout.
 * When startCollapsed=true (sidebarMode="hidden"), the sidebar begins
 * collapsed. A small toggle button lets the visitor open it.
 */
export default function CollapsibleSidebar({
  settings,
  projects,
  activeSlug,
  startCollapsed = false,
  children,
}: CollapsibleSidebarProps) {
  const [collapsed, setCollapsed] = useState(startCollapsed);

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

  if (collapsed) {
    return (
      <div className="min-h-screen flex">
        {/* Collapsed rail */}
        <div className="hidden md:flex md:flex-col md:items-center md:w-14 md:shrink-0 md:border-r md:border-black/10 md:py-5 md:gap-4">
          <button
            onClick={() => setCollapsed(false)}
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
        </div>

        {/* Main content — full width on desktop */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[minmax(260px,22vw)_minmax(0,1fr)]">
      <div className="relative">
        <Header
          settings={settings}
          projects={projects}
          activeSlug={activeSlug}
        />
        {/* Collapse button — desktop only */}
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
          className="absolute top-3 right-3 hidden md:flex items-center gap-1 rounded px-1.5 py-1 text-[0.72rem] text-black/35 hover:text-black/70 hover:bg-black/5 transition-colors"
          title="Hide sidebar"
        >
          ←
        </button>
      </div>
      <div className="min-w-0">
        {children}
      </div>
    </div>
  );
}
