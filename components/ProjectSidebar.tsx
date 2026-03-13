import type { ProjectSummary } from "../types";
import ProjectCard from "./ProjectCard";

interface ProjectSidebarProps {
  projects: ProjectSummary[];
  activeSlug?: string;
}

export default function ProjectSidebar({
  projects,
  activeSlug,
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
    <aside className="w-full max-w-sm" aria-label="Project list">
      <div className="max-h-80 overflow-y-auto md:max-h-none">
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
                <h3 className="pb-1 text-sm font-semibold text-neutral-900">
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
