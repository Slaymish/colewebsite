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
        "group block border-l-2 border-transparent py-1 pl-2 text-sm font-normal leading-snug text-black/60 transition-colors duration-100 hover:text-black",
        isActive &&
          "border-black font-medium text-black",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="text-sm font-normal leading-snug">{project.title}</span>
    </Link>
  );
}
