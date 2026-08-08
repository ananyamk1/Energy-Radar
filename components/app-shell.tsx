 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Building2, LayoutDashboard, Radio, Settings, Zap } from "lucide-react";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Zap },
  { href: "/signals", label: "Signals", icon: Radio }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#07100e] text-[#edf5f1]">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-white/8 bg-[#09130f]/90 px-4 py-5 backdrop-blur-xl lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7cf2b2] text-[#07100e]">
            <Zap size={19} fill="currentColor" />
          </span>
          <div>
            <div className="text-sm font-semibold tracking-wide">ENERGY RADAR</div>
            <div className="text-[11px] text-white/40">Infrastructure intelligence</div>
          </div>
        </Link>

        <div className="space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-white/8 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-white/30">
          Live sources
        </div>
        <div className="mt-3 space-y-2 px-3">
          {["ERCOT", "TCEQ"].map((source) => (
            <div key={source} className="flex items-center justify-between text-xs text-white/55">
              <span>{source}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#7cf2b2]" />
            </div>
          ))}
        </div>

        <div className="absolute bottom-5 left-4 right-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[.025] px-3 py-3 text-xs text-white/45">
            <Settings size={15} />
            System status
          </div>
        </div>
      </aside>

      <main className="lg:pl-60">{children}</main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 bg-[#09130f]/95 p-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md justify-around">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 px-4 py-1.5 text-[10px] ${pathname === href ? "text-[#7cf2b2]" : "text-white/45"}`}>
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
