import type { ProjectSummary } from "../types";
import ProjectCard from "./ProjectCard";

interface ProjectSidebarProps {
  projects: ProjectSummary[];
  categories?: string[];
  activeSlug?: string;
}

/**
 * This is used to display a list of projects in a sidebar.
 * @param param0
 * @returns
 */
export default function ProjectSidebar({
  projects,
  categories = [],
  activeSlug,
}: ProjectSidebarProps) {
  const normalizedCategories: string[] = categories
    .map((category) => category.trim())
    .filter((category) => category.length > 0);

  const uncategorized = projects.filter((project) => {
    const category = project.category?.trim();
    return !category;
  });

  const orderedGroups = normalizedCategories
    .map((category) => ({
      category,
      projects: projects.filter(
        (project) => project.category?.trim() === category,
      ),
    }))
    .filter((group) => group.projects.length > 0);

  const remainingCategoryNames = Array.from(
    new Set(
      projects.reduce<string[]>((acc, project) => {
        const category = project.category?.trim();
        if (category && !normalizedCategories.includes(category)) {
          acc.push(category);
        }
        return acc;
      }, []),
    ),
  );

  const remainingGroups = remainingCategoryNames.map((category) => ({
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
            {[...orderedGroups, ...remainingGroups].map((group) => (
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
