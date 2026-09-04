import type { Project } from "../types/project";

interface ProjectCardProps { project: Project; }

export function ProjectCard({ project }: ProjectCardProps) {
  const updated = new Date(project.updated_at ?? project.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return (
    <article className="project-card">
      <div className="project-card__icon" aria-hidden="true">{project.title.slice(0, 1).toUpperCase()}</div>
      <div><p className="eyebrow">{project.source_type} source · {project.status}</p><h3>{project.title}</h3><p className="muted">Updated {updated}</p></div>
      <button className="text-button" type="button" disabled>Open <span aria-hidden="true">→</span></button>
    </article>
  );
}
