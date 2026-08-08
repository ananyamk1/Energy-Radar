"use client";

import { Search } from "lucide-react";

export function TopBar({ onSearch }: { onSearch?: (value: string) => void }) {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-5 py-5 lg:px-8">
      <div className="pointer-events-auto flex items-center gap-2 border border-white/12 bg-[#07100e]/65 px-3 py-2 backdrop-blur-xl">
        <Search size={14} className="text-white/40" />
        <input
          aria-label="Search projects"
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder="Search projects..."
          className="w-44 bg-transparent text-xs text-white outline-none placeholder:text-white/35 sm:w-64"
        />
      </div>
      <div className="hidden pointer-events-auto items-center gap-5 text-[10px] uppercase tracking-[.14em] text-white/45 sm:flex">
        <span>ERCOT</span>
        <span className="h-1 w-1 rounded-full bg-[#83e5b0]" />
        <span>TCEQ</span>
        <span className="border-l border-white/15 pl-5">Updated just now</span>
      </div>
    </div>
  );
}
