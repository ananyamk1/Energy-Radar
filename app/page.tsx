"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/topbar";
import { EnergyMap } from "@/components/energy-map";
import { ProjectPanel } from "@/components/project-panel";
import { ProjectCard } from "@/components/project-card";
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

  console.log(projects);

  const accelerating = projects.filter(p => p.momentum === "Accelerating").length;
  const newSignals = projects.reduce((sum,p)=>sum+p.signals,0);

  return (
    <div>
      <section className="relative min-h-[calc(100vh-66px)] overflow-hidden">
        <TopBar onSearch={setQuery} />
        <div className="absolute inset-0">
          <EnergyMap projects={filtered} selectedProjectId={selected?.id ?? null} onSelect={setSelected} />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#07100e] via-[#07100e]/75 to-transparent px-5 pb-7 pt-32 lg:px-8">
          <div className="mx-auto flex max-w-[1600px] items-end justify-between gap-8">
            <div className="max-w-xl">
              <div className="text-[10px] uppercase tracking-[.22em] text-[#d9b86c]">Live infrastructure intelligence</div>
              <h1 className="mt-3 text-4xl font-semibold leading-[.95] tracking-[-.045em] sm:text-6xl">What&apos;s moving<br />in energy?</h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/55">Discover emerging projects, understand their momentum, and see the evidence behind what matters now.</p>
            </div>
            <div className="hidden items-end gap-10 border-l border-white/15 pl-8 md:flex">
              <div><div className="text-3xl font-semibold">{projects.length}</div><div className="mt-1 text-[9px] uppercase tracking-[.18em] text-white/35">Projects</div></div>
              <div><div className="text-3xl font-semibold">{accelerating}</div><div className="mt-1 text-[9px] uppercase tracking-[.18em] text-white/35">Accelerating</div></div>
              <div><div className="text-3xl font-semibold">{newSignals}</div><div className="mt-1 text-[9px] uppercase tracking-[.18em] text-white/35">Signals</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="flex items-end justify-between border-b border-white/10 pb-5">
          <div><div className="text-[10px] uppercase tracking-[.2em] text-white/35">Signal feed</div><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">Projects gaining momentum</h2></div>
          <div className="text-[10px] uppercase tracking-[.16em] text-white/35">{accelerating} accelerating</div>
        </div>
        <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3">
          {projects.filter(p => p.momentum === "Accelerating").slice(0,6).map((p,i)=>(
            <div key={p.id} className={`border-b border-white/10 ${i%3!==2?'lg:border-r':''} md:border-r lg:border-r-0`}><ProjectCard project={p} onClick={()=>setSelected(p)} /></div>
          ))}
        </div>
      </section>

      <ProjectPanel project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
