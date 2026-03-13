import Link from "next/link";
import type { ProjectSummary, SiteSettings } from "../types";
import ProjectSidebar from "./ProjectSidebar";
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
}

/**
 * This is used to display the header.
 * It contains the name of the person, social links, contact email, and CV download link.
 * @param param0
 * @returns
 */
export default function Header({
  settings,
  projects = [],
  activeSlug,
}: HeaderProps) {
  const name = settings?.name ?? "Cole Anderson";
  const cvUrl =
    settings?.cv?.url ||
    (settings?.cv?.file as { asset?: { url?: string } })?.asset?.url;
  const copyright =
    settings?.copyright ||
    `© ${new Date().getFullYear()} ${name}. All rights reserved.`;

  return (
    <header className="border-b border-black/10 px-5 py-6 md:sticky md:top-0 md:h-screen md:border-r md:border-b-0 md:px-7 md:py-8">
      <div className="flex h-full flex-col gap-6">
        <Link
          href="/"
          className="text-[clamp(2.5rem,5vw,3.7rem)] font-semibold leading-[0.92] tracking-[-0.05em]"
          aria-label={`${name} — home`}
        >
          {name}
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
                <NavigationMenuLink active={!activeSlug}>
                  Home
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
            {settings?.social_links?.map((link) => (
              <NavigationMenuItem key={link._key}>
                <NavigationMenuLink
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-plausible-event={`social-link-click-${link.platform}`}
                >
                  {link.label || link.platform}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
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
