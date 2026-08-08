 "use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/topbar";
import { EnergyMap } from "@/components/energy-map";
import { ProjectPanel } from "@/components/project-panel";
import { ProjectCard } from "@/components/project-card";
import { KPI } from "@/components/kpi";
import { useProjects } from "@/lib/api";
import { Project } from "@/lib/types";

export default function Overview() {
  const { projects } = useProjects();
  const [selected, setSelected] = useState<Project | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? projects.filter(p => `${p.name} ${p.city} ${p.state} ${p.technology}`.toLowerCase().includes(q)) : projects;
  }, [projects, query]);

  const accelerating = projects.filter(p => p.momentum === "Accelerating").length;
  const early = projects.filter(p => ["Concept", "FEL-1", "FEL-2", "FEED"].includes(p.stage)).length;

  return (
    <div>
      <TopBar onSearch={setQuery} />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-[.2em] text-[#7cf2b2]">Live infrastructure intelligence</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">What&apos;s moving in energy?</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Discover emerging projects, understand their momentum, and see why they matter.</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KPI label="Total projects" value={`${projects.length}`} />
          <KPI label="Early stage" value={`${early}`} detail="Concept → FEED" />
          <KPI label="Accelerating" value={`${accelerating}`} detail="Increasing activity" />
          <KPI label="New signals" value="7" detail="Last 24 hours" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Project map</div>
              <div className="text-xs text-white/35">{filtered.length} visible</div>
            </div>
            <EnergyMap projects={filtered} onSelect={setSelected} />
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold">Accelerating projects</div>
            <div className="space-y-2">
              {projects.filter(p => p.momentum === "Accelerating").slice(0, 4).map(p => (
                <ProjectCard key={p.id} project={p} onClick={() => setSelected(p)} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <ProjectPanel project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
