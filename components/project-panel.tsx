 "use client";

import { ArrowUpRight, Clock3, ExternalLink, MapPin, Sparkles, X } from "lucide-react";
import { Project } from "@/lib/types";
import { CategoryIcon } from "./icons";

export function ProjectPanel({ project, onClose }: { project: Project | null; onClose: () => void }) {
  if (!project) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[1000] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1714]/95 p-5 shadow-2xl backdrop-blur-xl sm:right-5 sm:left-auto sm:w-[390px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-white/45">
            <CategoryIcon category={project.category} size={14} />
            {project.category}
          </div>
          <h2 className="text-xl font-semibold tracking-tight">{project.name}</h2>
          <div className="mt-1 flex items-center gap-1 text-xs text-white/45">
            <MapPin size={13} /> {project.city}, {project.state}
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-white/45 hover:bg-white/5 hover:text-white" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/8 bg-white/[.025] p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/35">Opportunity</div>
          <div className="mt-1 text-2xl font-semibold text-[#7cf2b2]">{project.score}<span className="text-sm text-white/30">/100</span></div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[.025] p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/35">Confidence</div>
          <div className="mt-1 text-2xl font-semibold">{Math.round(project.confidence * 100)}<span className="text-sm text-white/30">%</span></div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#7cf2b2]/15 bg-[#7cf2b2]/5 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7cf2b2]">
          <Sparkles size={14} /> Why now?
        </div>
        <p className="mt-2 text-sm leading-6 text-white/75">{project.whyNow}</p>
        <div className="mt-3 text-xs text-white/45">{project.signals} signals · updated {project.updatedMinutesAgo} min ago</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div><div className="text-[11px] text-white/35">Stage</div><div className="mt-1 font-medium">{project.stage}</div></div>
        <div><div className="text-[11px] text-white/35">Momentum</div><div className="mt-1 font-medium text-[#7cf2b2]">🔥 {project.momentum}</div></div>
        <div><div className="text-[11px] text-white/35">Technology</div><div className="mt-1 font-medium">{project.technology}</div></div>
        <div><div className="text-[11px] text-white/35">Capacity</div><div className="mt-1 font-medium">{project.capacityMw ? `${project.capacityMw} MW` : "—"}</div></div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Evidence chain</div>
          <span className="text-[11px] text-white/35">3 source signals</span>
        </div>
        <div className="space-y-2">
          {[
            ["ERCOT", "Interconnection signal"],
            ["TCEQ", "Permit activity"],
            ["Developer", "Project announcement"]
          ].map(([source, label], i) => (
            <div key={source} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[.02] p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold">{i + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium">{source}</div>
                <div className="text-[11px] text-white/40">{label}</div>
              </div>
              <ExternalLink size={14} className="text-white/30" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/8 bg-white/[.02] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold"><Clock3 size={14} /> What changed?</div>
        <div className="mt-3 space-y-2 text-xs text-white/60">
          <div className="flex justify-between"><span>New signals</span><span className="text-white">+2</span></div>
          <div className="flex justify-between"><span>Confidence</span><span className="text-white">71% → {Math.round(project.confidence * 100)}%</span></div>
          <div className="flex justify-between"><span>Opportunity</span><span className="text-white">76 → {project.score}</span></div>
        </div>
      </div>

      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7cf2b2] px-4 py-3 text-sm font-semibold text-[#07100e]">
        Open full intelligence <ArrowUpRight size={15} />
      </button>
    </aside>
  );
}
