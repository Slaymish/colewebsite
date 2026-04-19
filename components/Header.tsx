"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProjectSummary, SiteSettings } from "../types";
import { cn } from "@/lib/utils";
import ProjectSidebar from "./ProjectSidebar";
import { urlFor } from "../lib/sanity";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { Separator } from "./ui/separator";

interface HeaderProps {
  settings: SiteSettings | null;
  projects?: ProjectSummary[];
  activeSlug?: string;
  /** When not on a project page, distinguishes Home vs About vs Contact. */
  currentPage?: "home" | "about" | "contact";
}

/**
 * Site header: name, optional logo, navigation, project list, and footer line.
 */
export default function Header({
  settings,
  projects = [],
  activeSlug,
  currentPage = "home",
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = settings?.name ?? "Cole Anderson";
  const cvUrl =
    settings?.cv?.url || (settings?.cv?.file as { asset?: { url?: string } })?.asset?.url;
  const copyright =
    settings?.copyright || `© ${new Date().getFullYear()} ${name}. All rights reserved.`;

  const logoUrl =
    settings?.logo?.asset && "_id" in settings.logo.asset
      ? urlFor(settings.logo).width(256).height(256).auto("format").url()
      : null;

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const nav = activeSlug !== undefined ? "project" : currentPage;

  const onProjectPage = activeSlug !== undefined;

  return (
    <header
      className={cn(
        "border-b border-black px-5 py-6 transition-colors duration-100 md:sticky md:top-0 md:h-screen md:border-r md:border-b-0 md:px-7 md:py-8",
        onProjectPage && "md:py-6",
      )}
    >
      <div className={cn("flex h-full flex-col gap-5", onProjectPage && "md:gap-4")}>
        {/* Mobile: name row + hamburger */}
        <div className="flex items-start justify-between gap-3">
          <Link href="/" className="flex items-start gap-3" aria-label={`${name} — home`}>
            {logoUrl ? (
              <span className="relative mt-1 h-11 w-11 shrink-0 overflow-hidden border border-black bg-white md:hidden">
                <Image
                  src={logoUrl}
                  alt={settings?.logo?.alt ?? name}
                  width={88}
                  height={88}
                  className="h-full w-full object-cover"
                />
              </span>
            ) : (
              <span
                className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center border border-black bg-white text-sm font-bold tracking-tight text-black md:hidden"
                aria-hidden
              >
                {initials || "—"}
              </span>
            )}
            <span className="text-[clamp(2.5rem,5vw,3.7rem)] leading-[0.92] font-bold tracking-[-0.06em]">
              {name}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="mt-2 flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <span
              className={cn(
                "block h-[2px] w-5 bg-black transition-transform duration-200",
                mobileOpen && "translate-y-[7px] rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-5 bg-black transition-opacity duration-200",
                mobileOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-5 bg-black transition-transform duration-200",
                mobileOpen && "-translate-y-[7px] -rotate-45",
              )}
            />
          </button>
        </div>

        {/* Collapsible content — always visible on md+, toggled on mobile */}
        <div
          className={cn(
            "flex flex-col gap-5 overflow-hidden transition-all duration-300 md:!flex md:!max-h-none md:!opacity-100",
            onProjectPage && "md:gap-4",
            mobileOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 md:opacity-100",
          )}
        >
          {settings?.bio && (
            <p
              className={cn(
                "max-w-sm text-[0.92rem] leading-[1.45] text-black/50",
                onProjectPage && "md:text-[0.88rem] md:text-black/50",
              )}
            >
              {settings.bio}
            </p>
          )}

          <NavigationMenu orientation="vertical">
            <NavigationMenuList aria-label="Main navigation">
              <NavigationMenuItem>
                <NavigationMenuLink asChild active={nav === "home"}>
                  <Link href="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild active={nav === "about"}>
                  <Link href="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild active={nav === "contact"}>
                  <Link href="/contact">Contact</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              {cvUrl && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-plausible-event="cv-download"
                  >
                    Info / CV
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {projects.length > 0 && (
            <>
              <Separator className="hidden md:block" />
              <ProjectSidebar projects={projects} activeSlug={activeSlug} muted={onProjectPage} />
            </>
          )}

          <div className="mt-auto flex flex-col gap-1 text-[0.7rem] leading-[1.45] text-black/40">
            <span>{copyright}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
