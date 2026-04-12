import type { ProjectSummary } from "../types";
import { cn } from "@/lib/utils";
import ProjectCard from "./ProjectCard";

interface ProjectSidebarProps {
  projects: ProjectSummary[];
  activeSlug?: string;
  /** Softer typography on project pages so the main column reads as primary. */
  muted?: boolean;
}

export default function ProjectSidebar({
  projects,
  activeSlug,
  muted = false,
}: ProjectSidebarProps) {
  const uncategorized = projects.filter((project) => {
    const category = project.category?.trim();
    return !category;
  });

  // Derive unique categories from projects, sorted alphabetically
  const categoryNames = Array.from(
    new Set(
      projects.reduce<string[]>((acc, project) => {
        const category = project.category?.trim();
        if (category) acc.push(category);
        return acc;
      }, []),
    ),
  ).sort();

  const groups = categoryNames.map((category) => ({
    category,
    projects: projects.filter(
      (project) => project.category?.trim() === category,
    ),
  }));

  return (
    <aside
      className={cn("w-full max-w-sm", muted && "md:opacity-[0.88]")}
      aria-label="Project list"
    >
      <div
        className={cn(
          "max-h-80 overflow-y-auto md:max-h-none",
          muted && "text-[0.8125rem]",
        )}
      >
        {projects.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-400">No projects yet.</p>
        ) : (
          <nav aria-label="Projects" className="space-y-4">
            {uncategorized.length > 0 && (
              <div className="space-y-1">
                {uncategorized.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    isActive={project.slug.current === activeSlug}
                  />
                ))}
              </div>
            )}
            {groups.map((group) => (
              <div key={group.category} className="space-y-1">
                <h3 className="mb-1 w-full bg-black px-2 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white">
                  {group.category}
                </h3>
                {group.projects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    isActive={project.slug.current === activeSlug}
                  />
                ))}
              </div>
            ))}
          </nav>
        )}
      </div>
    </aside>
  );
}
