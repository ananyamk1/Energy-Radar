"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Radio, Search, Zap } from "lucide-react";

const nav = [
  { href: "/", label: "Radar" },
  { href: "/projects", label: "Projects" },
  { href: "/signals", label: "Signals" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#07100e] text-[#f4f6f2]">
      <header className="sticky top-0 z-[900] border-b border-white/10 bg-[#07100e]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[66px] max-w-[1600px] items-center gap-8 px-5 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9b86c]/60 bg-[#d9b86c] text-[#07100e]">
              <Zap size={15} fill="currentColor" />
            </span>
            <span className="text-[13px] font-semibold tracking-[.16em]">ENERGY RADAR</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {nav.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative py-5 text-[11px] font-medium uppercase tracking-[.16em] transition ${
                    active ? "text-white" : "text-white/42 hover:text-white/80"
                  }`}
                >
                  {label}
                  {active && <span className="absolute bottom-0 left-0 right-0 h-px bg-[#d9b86c]" />}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 border-l border-white/10 pl-4 text-[10px] uppercase tracking-[.14em] text-white/40 sm:flex">
              <Radio size={13} /> Live sources
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-[#83e5b0] shadow-[0_0_10px_rgba(131,229,176,.8)]" />
              Live
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <div className="fixed bottom-4 left-1/2 z-[850] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#07100e]/85 p-1 shadow-2xl backdrop-blur-xl md:hidden">
        {nav.map(({ href, label }) => (
          <Link key={href} href={href} className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-[.12em] ${pathname === href ? "bg-white/10 text-white" : "text-white/45"}`}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
