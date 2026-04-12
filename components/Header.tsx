import Image from "next/image";
import Link from "next/link";
import type { ProjectSummary, SiteSettings } from "../types";
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
  /** When not on a project page, distinguishes Home vs About. */
  currentPage?: "home" | "about";
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
  const name = settings?.name ?? "Cole Anderson";
  const cvUrl =
    settings?.cv?.url ||
    (settings?.cv?.file as { asset?: { url?: string } })?.asset?.url;
  const copyright =
    settings?.copyright ||
    `© ${new Date().getFullYear()} ${name}. All rights reserved.`;

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

  const nav =
    activeSlug !== undefined ? "project" : currentPage;

  return (
    <header className="border-b border-black/10 px-5 py-6 md:sticky md:top-0 md:h-screen md:border-r md:border-b-0 md:px-7 md:py-8">
      <div className="flex h-full flex-col gap-6">
        <Link
          href="/"
          className="flex items-start gap-3"
          aria-label={`${name} — home`}
        >
          {logoUrl ? (
            <span className="relative mt-1 h-11 w-11 shrink-0 overflow-hidden rounded-full border border-black/10 bg-white">
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
              className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] text-sm font-semibold tracking-tight text-neutral-800"
              aria-hidden
            >
              {initials || "—"}
            </span>
          )}
          <span className="text-[clamp(2.5rem,5vw,3.7rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
            {name}
          </span>
        </Link>

        {settings?.bio && (
          <p className="max-w-sm text-[0.92rem] leading-[1.45] text-black/70">
            {settings.bio}
          </p>
        )}

        <NavigationMenu orientation="vertical">
          <NavigationMenuList aria-label="Main navigation">
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink active={nav === "home"}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink active={nav === "about"}>
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            {settings?.contact_email && (
              <NavigationMenuItem>
                <NavigationMenuLink href={`mailto:${settings.contact_email}`}>
                  Contact
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
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
            <ProjectSidebar
              projects={projects}
              activeSlug={activeSlug}
            />
          </>
        )}

        <div className="mt-auto flex flex-col gap-1 text-[0.8rem] leading-[1.45] text-black/60">
          <span>{copyright}</span>
        </div>
      </div>
    </header>
  );
}
