import Link from "next/link";
import type { ProjectSummary } from "../types";

interface ProjectFooterNavProps {
  projects: ProjectSummary[];
  currentSlug: string;
  createdAt?: string;
}

export default function ProjectFooterNav({
  projects,
  currentSlug,
  createdAt,
}: ProjectFooterNavProps) {
  const ix = projects.findIndex((p) => p.slug.current === currentSlug);
  const prev = ix > 0 ? projects[ix - 1] : null;
  const next = ix >= 0 && ix < projects.length - 1 ? projects[ix + 1] : null;

  return (
    <footer className="mt-14 flex flex-col gap-5 border-t border-black pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6">
        {createdAt && (
          <div className="text-[0.82rem] text-black/50">
            <time dateTime={createdAt}>
              {new Date(createdAt).toLocaleDateString("en-NZ", {
                year: "numeric",
                month: "long",
              })}
            </time>
          </div>
        )}
        <nav
          className="flex flex-col gap-2 text-[0.9rem] sm:flex-row sm:items-center sm:gap-5"
          aria-label="Adjacent projects"
        >
          {prev ? (
            <Link
              href={`/project/${prev.slug.current}`}
              className="text-black/50 transition hover:text-black"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span className="text-black/20">← Previous</span>
          )}
          {next ? (
            <Link
              href={`/project/${next.slug.current}`}
              className="text-black/50 transition hover:text-black"
            >
              {next.title} →
            </Link>
          ) : (
            <span className="text-black/20">Next →</span>
          )}
        </nav>
      </div>
    </footer>
  );
}
