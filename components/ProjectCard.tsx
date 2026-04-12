import Link from "next/link";
import { cn } from "@/lib/utils";
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
      className={cn(
        "group block border-l-2 border-transparent py-1 pl-2 text-sm font-normal leading-snug text-neutral-700 transition-colors hover:text-neutral-950",
        isActive &&
          "border-neutral-900 bg-black/[0.03] font-medium text-neutral-950",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="text-sm font-normal leading-snug">{project.title}</span>
    </Link>
  );
}
