import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLightMotion } from "@/hooks/useLightMotion";

// Real lat/lng for the 12 branches in mock-branches.ts + hadera-seed.ts.
// Hadera is the HQ — marked separately so the floating KPI badge anchors on it.
const HADERA = {
  name: "חדרה",
  lat: 32.434,
  lng: 34.9196,
  status: "good" as const,
};

const BRANCHES = [
  { name: "חיפה", lat: 32.794, lng: 34.9896, status: "good" as const },
  { name: "עפולה", lat: 32.607, lng: 35.2882, status: "warn" as const },
  { name: "טבריה", lat: 32.7922, lng: 35.5312, status: "good" as const },
  { name: "נתניה", lat: 32.3215, lng: 34.8532, status: "good" as const },
  { name: "כפר סבא", lat: 32.178, lng: 34.907, status: "good" as const },
  { name: "תל אביב", lat: 32.0853, lng: 34.7818, status: "good" as const },
  { name: "ראשון לציון", lat: 31.973, lng: 34.7925, status: "warn" as const },
  { name: "מודיעין", lat: 31.8969, lng: 35.0104, status: "good" as const },
  { name: "אשדוד", lat: 31.8014, lng: 34.6435, status: "danger" as const },
  { name: "באר שבע", lat: 31.2518, lng: 34.7913, status: "good" as const },
  { name: "אילת", lat: 29.5569, lng: 34.9498, status: "warn" as const },
];

const STATUS_COLOR = {
  good: "#10B981",
  warn: "#FBBF24",
  danger: "#F43F5E",
};

// Floating KPI badges anchored at specific branches. Rendered via L.divIcon
// so they pan with the map (decorative only — interactions are disabled).
const FLOATING_BADGES: Record<
  string,
  { label: string; kpi: string; delta: string; deltaColor: string }
> = {
  חדרה: {
    label: "מטה",
    kpi: "₪847K",
    delta: "+12.3%",
    deltaColor: "#10B981",
  },
  אילת: {
    label: "סניף הדרום",
    kpi: "94%",
    delta: "יעד",
    deltaColor: "#10B981",
  },
  אשדוד: {
    label: "התראת מלאי",
    kpi: "3 פריטים",
    delta: "דחוף",
    deltaColor: "#F43F5E",
  },
};

// ─── Leaflet icon factories ─────────────────────────────────────

function dotIcon(color: string, pulse: boolean) {
  const pulseEl = pulse ? '<span class="retalio-branch-pulse"></span>' : "";
  return L.divIcon({
    className: "retalio-branch-marker",
    html: `<div class="retalio-branch-dot" style="--dot-color: ${color};">${pulseEl}</div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function hqIcon(color: string, pulse: boolean) {
  const pulseEl = pulse ? '<span class="retalio-hq-pulse"></span>' : "";
  return L.divIcon({
    className: "retalio-branch-marker",
    html: `<div class="retalio-hq-dot" style="--dot-color: ${color};">${pulseEl}<span class="retalio-hq-inner"></span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function badgeIcon(args: {
  label: string;
  kpi: string;
  delta: string;
  deltaColor: string;
  branchName: string;
}) {
  const html = `
    <div class="retalio-kpi-badge">
      <p class="retalio-kpi-eyebrow">${args.label} · ${args.branchName}</p>
      <div class="retalio-kpi-row">
        <span class="retalio-kpi-value" dir="ltr">${args.kpi}</span>
        <span class="retalio-kpi-delta" style="color: ${args.deltaColor};">${args.delta}</span>
      </div>
    </div>
  `;
  return L.divIcon({
    className: "retalio-badge-marker",
    html,
    iconSize: [140, 52],
    iconAnchor: [-12, 26],
  });
}

// ─── Component ──────────────────────────────────────────────────

export function BranchNetworkMap() {
  const light = useLightMotion();
  const allBranches = [HADERA, ...BRANCHES];

  return (
    <div
      className="relative w-full max-w-[440px] mx-auto rounded-[20px] overflow-hidden border border-warm-border bg-white"
      style={{
        aspectRatio: "440 / 620",
        boxShadow: "0 20px 50px -24px rgba(220, 78, 89, 0.15)",
      }}
    >
      <MapContainer
        center={[31.4, 34.95]}
        zoom={7}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        style={{ height: "100%", width: "100%", background: "#FAFAFA" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
        />

        {/* HQ marker — Hadera */}
        <Marker
          position={[HADERA.lat, HADERA.lng]}
          icon={hqIcon(STATUS_COLOR.good, !light)}
          interactive={false}
        />

        {/* Branch dots */}
        {BRANCHES.map((b) => (
          <Marker
            key={b.name}
            position={[b.lat, b.lng]}
            icon={dotIcon(
              STATUS_COLOR[b.status],
              !light && b.status !== "good"
            )}
            interactive={false}
          />
        ))}

        {/* Floating KPI badges — desktop only */}
        {!light &&
          allBranches.map((b) => {
            const badge = FLOATING_BADGES[b.name];
            if (!badge) return null;
            return (
              <Marker
                key={`badge-${b.name}`}
                position={[b.lat, b.lng]}
                icon={badgeIcon({
                  ...badge,
                  branchName: b.name,
                })}
                interactive={false}
              />
            );
          })}
      </MapContainer>

      {/* Subtle "live" scan line — desktop only */}
      {!light && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 retalio-map-scan"
        />
      )}
    </div>
  );
}
