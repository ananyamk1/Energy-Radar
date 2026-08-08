 "use client";

import { useState } from "react";
import { TopBar } from "@/components/topbar";
import { ProjectCard } from "@/components/project-card";
import { ProjectPanel } from "@/components/project-panel";
import { useProjects } from "@/lib/api";
import { Project } from "@/lib/types";

export default function ProjectsPage() {
  const { projects } = useProjects();
  const [selected, setSelected] = useState<Project | null>(null);
  const [query, setQuery] = useState("");

  const list = projects.filter(p => `${p.name} ${p.city} ${p.state} ${p.technology}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <TopBar onSearch={setQuery} />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[.2em] text-[#7cf2b2]">Project intelligence</div>
          <h1 className="mt-2 text-3xl font-semibold">Projects</h1>
          <p className="mt-2 text-sm text-white/45">Explore the projects detected across the energy landscape.</p>
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {["All", "Accelerating", "Watch", "Stalled"].map((f) => (
            <span key={f} className="rounded-full border border-white/8 bg-white/[.02] px-3 py-1.5 text-xs text-white/55">{f}</span>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map(p => <ProjectCard key={p.id} project={p} onClick={() => setSelected(p)} />)}
        </div>
      </div>
      <ProjectPanel project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
