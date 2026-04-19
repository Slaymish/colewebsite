import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "../types";

interface ProjectCardProps {
  project: ProjectSummary;
  isActive?: boolean;
  /** When true, links to the edit route instead of the public project page. */
  editMode?: boolean;
}

/**
 * These are used in the project sidebar to link to individual projects.
 */
export default function ProjectCard({
  project,
  isActive = false,
  editMode = false,
}: ProjectCardProps) {
  const slug = project.slug.current;
  const href = editMode ? `/admin/edit/${slug}` : `/project/${slug}`;

  return (
    <Link
      href={href}
      className={cn(
        "group block border-l-2 border-transparent py-1 pl-2 text-sm leading-snug font-normal text-black/60 transition-colors duration-100 hover:text-black",
        isActive && "border-black font-medium text-black",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="text-sm leading-snug font-normal">{project.title}</span>
    </Link>
  );
}
