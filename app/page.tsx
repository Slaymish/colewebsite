import { getAllPublishedProjects, getSiteSettings } from "../lib/queries";
import { personJsonLd, websiteJsonLd } from "../lib/structured-data";
import Header from "../components/Header";
import ProjectSidebar from "../components/ProjectSidebar";

export const revalidate = 60;

export default async function HomePage() {
  const [projects, settings] = await Promise.all([
    getAllPublishedProjects(),
    getSiteSettings(),
  ]);

  const name = settings?.name ?? "Cole Anderson";
  const bio = settings?.bio ?? "Designer and creative.";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            personJsonLd(settings),
            websiteJsonLd(settings),
          ]),
        }}
      />

      <Header settings={settings} />

      <div className="flex min-h-[calc(100vh-57px)] flex-col md:flex-row">
        {/* Left: sticky project list */}
        <ProjectSidebar projects={projects} />

        {/* Right: hero / intro panel */}
        <main
          id="main-content"
          className="flex flex-1 flex-col justify-center px-10 py-20 md:px-16"
          aria-label="Home"
        >
          <section aria-labelledby="hero-heading">
            <h1
              id="hero-heading"
              className="text-5xl font-semibold tracking-tight text-neutral-900 md:text-6xl lg:text-7xl"
            >
              {name}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-500">
              {bio}
            </p>

            {projects.length > 0 && (
              <p className="mt-10 text-sm text-neutral-400">
                Select a project from the list{" "}
                <span className="hidden md:inline">on the left</span>
                <span className="md:hidden">above</span> to view it.
              </p>
            )}

            {settings?.contact_email && (
              <div className="mt-12">
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900"
                >
                  Get in touch
                </a>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
