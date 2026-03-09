import Link from "next/link";
import type { ProjectSummary } from "../types";

interface ProjectCardProps {
  project: ProjectSummary;
  isActive?: boolean;
}

/**
 * These are used in the project sidebar to link to individual projects.
 * @param param0
 * @returns
 */
export default function ProjectCard({
  project,
  isActive = false,
}: ProjectCardProps) {
  const slug = project.slug.current;

  return (
    <Link
      href={`/project/${slug}`}
      className={`group block border-b border-neutral-100 py-3 px-4 transition-colors hover:bg-neutral-50 ${
        isActive ? "bg-neutral-50" : ""
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <h2 className="text-sm font-medium leading-snug">{project.title}</h2>
      {project.created_at && (
        <p className="mt-1 text-xs text-neutral-400">
          {new Date(project.created_at).getFullYear()}
        </p>
      )}
    </Link>
  );
}
