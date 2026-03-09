import Link from 'next/link'
import type { SiteSettings } from '../types'

interface HeaderProps {
  settings: SiteSettings | null
}

export default function Header({ settings }: HeaderProps) {
  const name = settings?.name ?? 'Cole Anderson'
  const cvUrl = settings?.cv?.url || (settings?.cv?.file as { asset?: { url?: string } })?.asset?.url

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
          aria-label={`${name} — home`}
        >
          {name}
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-6 text-sm">
            {settings?.social_links?.map((link) => (
              <li key={link._key}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="capitalize text-neutral-500 hover:text-neutral-900 transition-colors"
                  data-plausible-event={`social-link-click-${link.platform}`}
                >
                  {link.label || link.platform}
                </a>
              </li>
            ))}
            {settings?.contact_email && (
              <li>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Contact
                </a>
              </li>
            )}
            {cvUrl && (
              <li>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-neutral-900 transition-colors"
                  data-plausible-event="cv-download"
                >
                  CV
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
