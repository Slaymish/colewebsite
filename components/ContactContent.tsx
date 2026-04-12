import type { SiteSettings } from "../types";
import { platformLabels } from "../lib/platformLabels";

interface ContactContentProps {
  settings: SiteSettings | null;
}

export default function ContactContent({ settings }: ContactContentProps) {
  const socialLinks = settings?.social_links ?? [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-black sm:text-4xl">
        Contact
      </h1>

      <div className="space-y-4 text-[1rem] leading-[1.7] text-black/70">
        {settings?.contact_email && (
          <div className="flex flex-col gap-1">
            <span className="text-[0.75rem] uppercase tracking-wider text-black/40">Email</span>
            <a
              href={`mailto:${settings.contact_email}`}
              className="text-[0.95rem] text-black/80 underline decoration-black/25 underline-offset-2 transition hover:decoration-black/60"
            >
              {settings.contact_email}
            </a>
          </div>
        )}

        {settings?.contact_phone && (
          <div className="flex flex-col gap-1">
            <span className="text-[0.75rem] uppercase tracking-wider text-black/40">Phone</span>
            <a
              href={`tel:${settings.contact_phone}`}
              className="text-[0.95rem] text-black/80 underline decoration-black/25 underline-offset-2 transition hover:decoration-black/60"
            >
              {settings.contact_phone}
            </a>
          </div>
        )}
      </div>

      {socialLinks.length > 0 && (
        <div className="pt-8">
          <span className="block mb-4 text-[0.75rem] uppercase tracking-wider text-black/40">
            Socials
          </span>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link._key}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-black px-4 py-1.5 text-[0.82rem] text-black/50 transition hover:border-black hover:text-black"
              >
                {link.label ||
                  platformLabels[link.platform?.toLowerCase()] ||
                  link.platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
