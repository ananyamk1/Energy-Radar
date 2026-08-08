 "use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Project } from "@/lib/types";
import { CategoryIcon } from "./icons";

function markerIcon(project: Project) {
  const accent = project.momentum === "Accelerating" ? "#7cf2b2" : project.momentum === "Stalled" ? "#f87171" : "#f4c95d";
  return L.divIcon({
    className: "energy-marker",
    html: `<div style="width:30px;height:30px;border-radius:50%;background:${accent};border:4px solid rgba(7,16,14,.9);box-shadow:0 0 0 1px ${accent}55,0 0 22px ${accent}55;display:flex;align-items:center;justify-content:center;color:#07100e;font-weight:800;font-size:10px">${project.score}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

function FitBounds({ projects }: { projects: Project[] }) {
  const map = useMap();
  const bounds = useMemo(() => projects.map((p) => [p.lat, p.lng] as [number, number]), [projects]);
  if (bounds.length) map.fitBounds(bounds, { padding: [35, 35], maxZoom: 7 });
  return null;
}

export function EnergyMap({ projects, onSelect }: { projects: Project[]; onSelect: (p: Project) => void }) {
  return (
    <div className="h-[560px] overflow-hidden rounded-2xl border border-white/8">
      <MapContainer center={[31.0, -98.5]} zoom={6} scrollWheelZoom className="z-0">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds projects={projects} />
        {projects.map((project) => (
          <Marker key={project.id} position={[project.lat, project.lng]} icon={markerIcon(project)}>
            <Popup>
              <div className="min-w-[210px]">
                <div className="mb-2 flex items-center gap-2 text-xs text-white/50">
                  <CategoryIcon category={project.category} size={14} />
                  {project.category}
                </div>
                <div className="text-sm font-semibold">{project.name}</div>
                <div className="mt-1 text-xs text-white/50">{project.city}, {project.state} · {project.capacityMw ? `${project.capacityMw} MW` : "Grid infrastructure"}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-[#7cf2b2]">{project.momentum}</span>
                  <span className="text-sm font-bold">{project.score}</span>
                </div>
                <button onClick={() => onSelect(project)} className="mt-3 w-full rounded-lg bg-[#7cf2b2] px-3 py-2 text-xs font-semibold text-[#07100e]">
                  View intelligence
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
