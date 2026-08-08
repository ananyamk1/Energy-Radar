"use client";

import { ArrowUpRight, ExternalLink, MapPin, X } from "lucide-react";
import { Project } from "@/lib/types";
import { CategoryIcon } from "./icons";

export function ProjectPanel({ project, onClose }: { project: Project | null; onClose: () => void }) {
  if (!project) return null;
  const confidence = Math.round(project.confidence * 100);

  return (
    <aside className="project-intel-panel fixed inset-y-0 right-0 z-[1000] w-full max-w-[470px] overflow-y-auto border-l border-black/10 bg-[#f4f3ed]/96 text-[#111715] shadow-[-24px_0_80px_rgba(0,0,0,.18)] backdrop-blur-2xl">
      <div className="p-7 sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="mb-5 flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-black/45">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-black/10"><CategoryIcon category={project.category} size={12} /></span>
              {project.category}
            </div>
            <div className="text-[10px] uppercase tracking-[.22em] text-black/40">01 · Project intelligence</div>
            <h2 className="mt-2 text-3xl font-semibold leading-[1.05] tracking-[-.03em]">{project.name}</h2>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-black/50"><MapPin size={13} /> {project.city}, {project.state}</div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/50 transition hover:bg-black/5 hover:text-black" aria-label="Close"><X size={17} /></button>
        </div>

        <div className="mt-9 grid grid-cols-[1fr_auto] items-end border-y border-black/10 py-6">
          <div><div className="text-[10px] uppercase tracking-[.2em] text-black/40">Opportunity</div><div className="mt-1 text-6xl font-semibold tracking-[-.06em]">{project.score}</div></div>
          <div className="text-right"><div className="text-[10px] uppercase tracking-[.18em] text-black/40">Confidence</div><div className="mt-1 text-2xl font-medium">{confidence}%</div></div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[.16em] text-[#8c6e29]">↑ {project.momentum}</div>
          <div className="text-xs text-black/45">{project.capacityMw} MW · {project.technology}</div>
        </div>

        <section className="mt-10">
          <div className="text-[10px] font-semibold uppercase tracking-[.2em] text-black/40">Why now?</div>
          <p className="mt-3 text-lg leading-7 tracking-[-.01em]">{project.whyNow}</p>
          <div className="mt-5 text-[10px] uppercase tracking-[.16em] text-black/40">{project.signals} independent signals · updated {project.updatedMinutesAgo} min ago</div>
        </section>

        <section className="mt-10 border-t border-black/10 pt-7">
          <div className="text-[10px] font-semibold uppercase tracking-[.2em] text-black/40">Development</div>
          <div className="mt-5 flex items-center gap-1 text-[9px] uppercase tracking-[.12em] text-black/35">
            {['Concept','FEL-1','FEED','FID','Construction','COD'].map((stage, i) => (
              <div key={stage} className="flex min-w-0 flex-1 items-center gap-1">
                <span className={`h-2 w-2 shrink-0 rounded-full border ${stage === project.stage ? 'border-[#8c6e29] bg-[#d9b86c]' : 'border-black/20 bg-transparent'}`} />
                {i < 5 && <span className="h-px flex-1 bg-black/10" />}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm font-medium">Current stage: {project.stage}</div>
        </section>

        <section className="mt-10 border-t border-black/10 pt-7">
          <div className="flex items-center justify-between"><div className="text-[10px] font-semibold uppercase tracking-[.2em] text-black/40">Evidence chain</div><span className="text-[10px] uppercase tracking-[.14em] text-black/35">3 signals</span></div>
          <div className="mt-5">
            {[['ERCOT','Interconnection signal','Aug 01'],['TCEQ','Permit activity','Aug 04'],['Developer','Project announcement','Aug 07']].map(([source,label,date],i)=>(
              <div key={source} className="group flex items-center gap-4 border-b border-black/10 py-4 last:border-b-0">
                <span className="text-xs text-black/35">0{i+1}</span>
                <div className="min-w-0 flex-1"><div className="text-sm font-medium">{source}</div><div className="mt-1 text-xs text-black/45">{label} · {date}</div></div>
                <ExternalLink size={14} className="text-black/30 transition group-hover:text-black/70" />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-black/10 pt-7">
          <div className="text-[10px] font-semibold uppercase tracking-[.2em] text-black/40">What changed?</div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-black/50">New signals</span><span>+2</span></div>
            <div className="flex justify-between"><span className="text-black/50">Confidence</span><span>71% → {confidence}%</span></div>
            <div className="flex justify-between"><span className="text-black/50">Opportunity</span><span>76 → {project.score}</span></div>
          </div>
        </section>

        <button className="mt-10 flex w-full items-center justify-center gap-2 bg-[#111715] px-5 py-3.5 text-xs font-semibold uppercase tracking-[.14em] text-white transition hover:bg-[#26302c]">Open full intelligence <ArrowUpRight size={14} /></button>
      </div>
    </aside>
  );
}
