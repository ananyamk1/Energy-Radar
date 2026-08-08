export function KPI({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[.025] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/35">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {detail && <div className="mt-1 text-xs text-white/40">{detail}</div>}
    </div>
  );
}
