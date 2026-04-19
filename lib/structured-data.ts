import type { Project, SiteSettings } from "../types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://coleanderson.com";

export function personJsonLd(settings: SiteSettings | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings?.name ?? "Cole Anderson",
    url: SITE_URL,
    email: settings?.contact_email,
    sameAs: settings?.social_links?.map((l) => l.url).filter(Boolean) ?? [],
  };
}

export function websiteJsonLd(settings: SiteSettings | null) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings?.name ?? "Cole Anderson",
    url: SITE_URL,
    author: {
      "@type": "Person",
      name: settings?.name ?? "Cole Anderson",
    },
  };
}

export function projectJsonLd(project: Project, settings: SiteSettings | null) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.meta_description,
    url: `${SITE_URL}/project/${project.slug.current}`,
    author: {
      "@type": "Person",
      name: settings?.name ?? "Cole Anderson",
    },
    dateCreated: project.created_at,
    keywords: project.tags?.join(", "),
  };
}
