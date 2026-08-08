 "use client";

import { TopBar } from "@/components/topbar";
import { SignalIcon } from "@/components/icons";
import { signals } from "@/lib/mock-data";

export default function SignalsPage() {
  return (
    <div>
      <TopBar />
      <div className="px-5 py-6 lg:px-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[.2em] text-[#7cf2b2]">Live signal feed</div>
          <h1 className="mt-2 text-3xl font-semibold">Signals</h1>
          <p className="mt-2 text-sm text-white/45">Recent public signals that can change project intelligence.</p>
        </div>
        <div className="space-y-2">
          {signals.map((signal) => (
            <div key={signal.id} className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[.02] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7cf2b2]/8 text-[#7cf2b2]">
                <SignalIcon category={signal.category} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-medium">{signal.project}</div>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/45">{signal.category}</span>
                </div>
                <div className="mt-1 text-xs text-white/40">{signal.source} · {signal.time}</div>
              </div>
              <div className="text-xs font-medium text-[#7cf2b2]">{signal.importance}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
