import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "../../lib/queries";
import ContactContent from "../../components/ContactContent";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contact",
    description: "Get in touch with Cole Anderson.",
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const name = settings?.name ?? "Cole Anderson";
  const cvUrl =
    settings?.cv?.url ||
    (settings?.cv?.file as { asset?: { url?: string } })?.asset?.url;

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-5 sm:px-10 md:px-14 border-b border-black/8">
        <Link
          href="/"
          className="text-[0.85rem] text-black/50 transition hover:text-black/80"
        >
          ← {name}
        </Link>
        {cvUrl && (
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.85rem] text-black/50 transition hover:text-black/80"
          >
            CV / Info
          </a>
        )}
      </nav>

      <main
        id="main-content"
        className="mx-auto max-w-2xl px-6 py-12 sm:px-10 sm:py-16 md:py-20"
        aria-label="Contact"
      >
        <ContactContent settings={settings} />
      </main>
    </div>
  );
}
