import Link from "next/link";
import type { ProjectSummary, SiteSettings } from "../types";
import ProjectSidebar from "./ProjectSidebar";

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
    <header className="site-sidebar">
      <div className="site-sidebar-inner">
        <Link href="/" className="site-title" aria-label={`${name} — home`}>
          {name}
        </Link>

        {settings?.bio && <p className="site-meta">{settings.bio}</p>}

        <nav aria-label="Main navigation" className="site-nav">
          <Link href="/" className="site-nav-link">
            Home
          </Link>
          {settings?.contact_email && (
            <a
              href={`mailto:${settings.contact_email}`}
              className="site-nav-link"
            >
              Contact
            </a>
          )}
          {cvUrl && (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav-link"
              data-plausible-event="cv-download"
            >
              Info / CV
            </a>
          )}
          {settings?.social_links?.map((link) => (
            <a
              key={link._key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav-link"
              data-plausible-event={`social-link-click-${link.platform}`}
            >
              {link.label || link.platform}
            </a>
          ))}
        </nav>

        {projects.length > 0 && (
          <ProjectSidebar projects={projects} activeSlug={activeSlug} />
        )}

        <div className="site-sidebar-footer">
          <span>{copyright}</span>
        </div>
      </div>
    </header>
  );
}
