 "use client";

import { Search, Activity } from "lucide-react";

export function TopBar({ onSearch }: { onSearch?: (value: string) => void }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4 lg:px-8">
      <div className="relative max-w-xl flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" size={16} />
        <input
          aria-label="Search projects"
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder="Search projects, companies, locations..."
          className="w-full rounded-xl border border-white/8 bg-white/[.025] py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#7cf2b2]/40"
        />
      </div>
      <div className="hidden items-center gap-2 text-xs text-white/50 sm:flex">
        <span className="flex items-center gap-2 rounded-full border border-[#7cf2b2]/15 bg-[#7cf2b2]/5 px-3 py-1.5">
          <Activity size={13} className="text-[#7cf2b2]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#7cf2b2]" />
          LIVE
        </span>
        <span>Updated just now</span>
      </div>
    </header>
  );
}
