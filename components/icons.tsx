import {
  BatteryCharging, Building2, Factory, Gauge, Network, SunMedium, Zap
} from "lucide-react";
import { EnergyCategory } from "@/lib/types";

export function CategoryIcon({ category, size = 16 }: { category: EnergyCategory; size?: number }) {
  const common = { size, strokeWidth: 1.8 };
  switch (category) {
    case "Data Center": return <Building2 {...common} />;
    case "Storage": return <BatteryCharging {...common} />;
    case "Transmission": return <Network {...common} />;
    case "Renewable": return <SunMedium {...common} />;
    case "Industrial": return <Factory {...common} />;
    default: return <Zap {...common} />;
  }
}

export function SignalIcon({ category, size = 16 }: { category: string; size?: number }) {
  const common = { size, strokeWidth: 1.8 };
  if (category.toLowerCase().includes("permit")) return <Factory {...common} />;
  if (category.toLowerCase().includes("load")) return <Gauge {...common} />;
  return <Zap {...common} />;
}
