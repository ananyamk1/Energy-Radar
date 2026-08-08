import { MapPin } from "lucide-react";
import { Project } from "@/lib/types";
import { CategoryIcon } from "./icons";

export function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group w-full rounded-xl border border-white/8 bg-white/[.02] p-4 text-left transition hover:border-white/15 hover:bg-white/[.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-white/45">
          <CategoryIcon category={project.category} size={14} />
          {project.category}
        </div>
        <span className="text-sm font-semibold text-[#7cf2b2]">{project.score}</span>
      </div>
      <div className="mt-3 text-sm font-semibold">{project.name}</div>
      <div className="mt-1 flex items-center gap-1 text-xs text-white/40"><MapPin size={12}/>{project.city}, {project.state}</div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-[#7cf2b2]">🔥 {project.momentum}</span>
        <span className="text-white/35">{project.stage}</span>
      </div>
    </button>
  );
}
