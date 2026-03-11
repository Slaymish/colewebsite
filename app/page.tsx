import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import { getAllPublishedProjects, getSiteSettings } from "../lib/queries";
import { urlFor } from "../lib/sanity";
import { personJsonLd, websiteJsonLd } from "../lib/structured-data";

export const revalidate = 60;

/**
 * This is used to display the home page.
 * It fetches the projects and settings from the database and displays them.
 * @returns
 */
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

      <div className="site-shell">
        <Header settings={settings} projects={projects} />

        <main id="main-content" className="site-main" aria-label="Home">
          <div className="content-column">
            <div className="content-stack">
              <section aria-labelledby="hero-heading" className="home-intro">
                <h1 id="hero-heading" className="home-intro-title">
                  Selected Work
                </h1>
                <p className="home-intro-copy">{bio}</p>
              </section>

              <section
                className="home-projects"
                aria-label={`${name} projects`}
              >
                {projects.map((project) => {
                  const cover = project.cover_image
                    ? urlFor(project.cover_image)
                        .width(1600)
                        .auto("format")
                        .url()
                    : null;

                  return (
                    <Link
                      key={project._id}
                      href={`/project/${project.slug.current}`}
                      className="home-project-link"
                    >
                      {cover && (
                        <div className="home-project-image">
                          <Image
                            src={cover}
                            alt={project.cover_image?.alt ?? project.title}
                            width={1600}
                            height={1100}
                            className="h-auto w-full"
                            sizes="(max-width: 899px) 100vw, min(1040px, 78vw)"
                          />
                        </div>
                      )}
                      <div className="home-project-info">
                        <h2 className="home-project-title">{project.title}</h2>
                        {project.created_at && (
                          <span className="home-project-meta">
                            {new Date(project.created_at).getFullYear()}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
