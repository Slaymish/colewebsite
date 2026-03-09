import { getAllPublishedProjects, getSiteSettings } from "../lib/queries";
import { personJsonLd, websiteJsonLd } from "../lib/structured-data";
import Header from "../components/Header";

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

      {/* Hero section - full viewport, centered */}
      <main
        id="main-content"
        className="flex min-h-[calc(100vh-57px)] flex-col justify-center px-6 py-20 text-center md:px-16"
        aria-label="Home"
      >
        <section aria-labelledby="hero-heading" className="mx-auto max-w-2xl">
          <h1
            id="hero-heading"
            className="text-5xl font-semibold tracking-tight text-neutral-900 md:text-6xl lg:text-7xl"
          >
            {name}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-neutral-500">{bio}</p>

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

      {/* Projects section - appears after scrolling */}
      {projects.length > 0 && (
        <div className="border-t border-neutral-200">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-16">
            <h2 className="mb-8 text-2xl font-semibold text-neutral-900">
              Projects
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="rounded-lg border border-neutral-200 p-6 transition-colors hover:border-neutral-300"
                >
                  <h3 className="text-lg font-medium text-neutral-900">
                    {project.title}
                  </h3>
                  {project.created_at && (
                    <p className="mt-2 text-sm text-neutral-400">
                      {new Date(project.created_at).getFullYear()}
                    </p>
                  )}
                  {project.tags && project.tags.length > 0 && (
                    <p className="mt-2 text-sm text-neutral-500">
                      {project.tags.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
