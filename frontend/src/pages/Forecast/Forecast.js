import { useEffect, useMemo, useRef, useState } from "react";
import {
  Layout,
  Select,
  Radio,
  Slider,
  Space,
  Button,
  Spin,
  notification,
  Divider,
  List,
} from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import {
  MapContainer,
  LayersControl,
  LayerGroup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faGrip,
  faListOl,
  faLayerGroup,
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import L from "leaflet";
// NetCDF parsing is done server-side (NetCDF4 supported via xarray).
import Axios from "axios";
import turfBuffer from "@turf/buffer";

import HeaderMap from "../../components/HeaderMap";
import { setmodule } from "../../slices/mapView";

import "leaflet/dist/leaflet.css";
import "../../style/map.css";
import "../../style/custom.css";
import "../../style/sidebar.css";

import pakistanGeojsonUrl from "../../pakistan.geojson";
import AddMask from "../../utils/AddMask";

const headerStyle = {
  textAlign: "center",
  color: "#fff",
  background: "linear-gradient(180deg, #5C4033, #C4A484)",
  zIndex: 15000,
  height: "5em",
};

const contentStyle = {
  color: "#fff",
  background: "#fff",
};

const ncContext = require.context("../../ncreader/nc_files", false, /\.nc$/i);

function isProbablyLon360(lonData) {
  if (!lonData || lonData.length < 2) return false;
  const lonMin = Math.min(...lonData);
  const lonMax = Math.max(...lonData);
  return lonMin >= 0 && lonMax > 180;
}

function normalizeLonToDataset(lon, lonData) {
  if (!Number.isFinite(lon)) return lon;
  if (!isProbablyLon360(lonData)) return lon;
  return lon < 0 ? lon + 360 : lon;
}

function lowerBound(values, target, ascending) {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    const v = values[mid];
    if (ascending ? v < target : v > target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

function upperBound(values, target, ascending) {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    const v = values[mid];
    if (ascending ? v <= target : v >= target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

function fractionalIndex(values, target, ascending) {
  const n = values.length;
  if (n <= 1) return 0;

  const i = lowerBound(values, target, ascending);
  if (i <= 0) return 0;
  if (i >= n) return n - 1;

  const v0 = values[i - 1];
  const v1 = values[i];
  const denom = v1 - v0;
  if (!Number.isFinite(denom) || denom === 0) return i - 1;
  const t = (target - v0) / denom;
  return (i - 1) + Math.max(0, Math.min(1, t));
}

function estimateStep(values) {
  if (!values || values.length < 2) return 0;
  const diffs = [];
  for (let i = 1; i < values.length; i += 1) {
    const d = values[i] - values[i - 1];
    if (Number.isFinite(d) && d !== 0) diffs.push(Math.abs(d));
  }
  if (!diffs.length) return 0;
  diffs.sort((a, b) => a - b);
  return diffs[Math.floor(diffs.length / 2)];
}

function boundsEdgesFromCenters(values) {
  if (!values || values.length === 0) return null;
  if (values.length === 1) {
    const v = Number(values[0]);
    if (!Number.isFinite(v)) return null;
    return { minEdge: v, maxEdge: v };
  }

  const first = Number(values[0]);
  const second = Number(values[1]);
  const last = Number(values[values.length - 1]);
  const prev = Number(values[values.length - 2]);
  if (![first, second, last, prev].every(Number.isFinite)) return null;

  const step0 = second - first;
  const stepN = last - prev;

  // Values are cell centers; edges are half-step beyond end centers.
  const edgeA = first - step0 / 2;
  const edgeB = last + stepN / 2;
  const minEdge = Math.min(edgeA, edgeB);
  const maxEdge = Math.max(edgeA, edgeB);
  return { minEdge, maxEdge };
}

function getGeojsonBounds(geojson, lonData) {
  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  const bump = (coord) => {
    if (!coord || coord.length < 2) return;
    let lon = Number(coord[0]);
    const lat = Number(coord[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return;
    lon = normalizeLonToDataset(lon, lonData);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  };

  const walkCoords = (coords) => {
    if (!Array.isArray(coords)) return;
    if (coords.length && typeof coords[0] === "number") {
      bump(coords);
      return;
    }
    coords.forEach(walkCoords);
  };

  const asFeatures = (g) => {
    if (!g) return [];
    if (Array.isArray(g.features)) return g.features;
    if (g.type === "Feature") return [g];
    if (typeof g.type === "string" && g.coordinates) {
      return [{ type: "Feature", properties: {}, geometry: g }];
    }
    return [];
  };

  asFeatures(geojson).forEach((feature) => {
    const geometry = feature?.geometry;
    if (!geometry) return;
    walkCoords(geometry.coordinates);
  });

  if (!Number.isFinite(minLon) || !Number.isFinite(minLat)) return null;
  return { minLon, maxLon, minLat, maxLat };
}

function parseMonthFromFilename(filename) {
  const match = filename.match(/\.(\d{2})M(?:_classic)?\.nc$/i);
  if (!match) return null;
  const month = Number(match[1]);
  return Number.isFinite(month) ? month : null;
}

function buildNcFileOptionsByIndex() {
  const files = ncContext.keys().map((key) => {
    const filename = key.replace(/^\.\//, "");
    const url = ncContext(key);
    const month = parseMonthFromFilename(filename);
    const upper = filename.toUpperCase();
    const indexType = upper.includes(".SPI.")
      ? "SPI"
      : upper.includes("NPSMI") || upper.includes("NSPI")
      ? "NSPI"
      : upper.includes("ALERT_DROUGHT")
      ? "ALERT"
      : null;

    return { filename, url, month, indexType };
  });

  const byIndex = { SPI: [], NSPI: [], ALERT: [] };
  files.forEach((file) => {
    if (!file.indexType) return;
    byIndex[file.indexType].push({
      label:
        file.indexType === "SPI" && file.month
          ? String(file.month)
          : file.indexType === "ALERT"
          ? file.filename
          : file.filename,
      value: file.url,
      meta: { filename: file.filename, month: file.month },
    });
  });

  // ALERT should come from a single file (all lead months/time steps inside it).
  // Prefer the Alert_drought.nc variant when multiple exist.
  if (byIndex.ALERT.length > 1) {
    const preferred = byIndex.ALERT.find((o) =>
      String(o.meta?.filename || "").toUpperCase().includes("ALERT_DROUGHT")
    );
    byIndex.ALERT = preferred ? [preferred] : [byIndex.ALERT[0]];
  }

  Object.keys(byIndex).forEach((key) => {
    byIndex[key].sort((a, b) => {
      const am = a.meta?.month;
      const bm = b.meta?.month;
      if (am != null && bm != null) return am - bm;
      if (am != null) return -1;
      if (bm != null) return 1;
      return String(a.meta?.filename || a.label).localeCompare(
        String(b.meta?.filename || b.label)
      );
    });
  });

  return byIndex;
}

const classicOptionsByIndex = buildNcFileOptionsByIndex();

const LEGENDS = {
  SPI: {
    title: "Standardized Precipitation Index ",
    stops: [
      { label: "Normal", range: "(-0.5 to 3)", color: "#1E5BFF" },
      { label: "Mild", range: "(-1 to -0.5)", color: "#00C7D4" },
      { label: "Moderate", range: "(-1.5 to -1)", color: "#F4D03F" },
      { label: "Severe", range: "(-2 to -1.5)", color: "#F39C12" },
      { label: "Extreme", range: "(-3 to -2)", color: "#E74C3C" },
    ],
    getColor: (v) => {
      if (!Number.isFinite(v)) return null;
      if (v >= -0.5) return "#1E5BFF";
      if (v >= -1) return "#00C7D4";
      if (v >= -1.5) return "#F4D03F";
      if (v >= -2) return "#F39C12";
      return "#E74C3C";
    },
  },
  NSPI: {
    title: "NPSMI",
    stops: [
      { label: "Normal", range: "(0 to 0.5)", color: "#2E7D32" },
      { label: "Mild", range: "(0.5 to 0.6)", color: "#66BB6A" },
      { label: "Moderate", range: "(0.6 to 0.7)", color: "#FBC02D" },
      { label: "High", range: "(0.7 to 0.8)", color: "#FB8C00" },
      { label: "Severe", range: "(0.8+)", color: "#C62828" },
    ],
    getColor: (v) => {
      if (!Number.isFinite(v)) return null;
      if (v < 0.5) return "#2E7D32";
      if (v < 0.6) return "#66BB6A";
      if (v < 0.7) return "#FBC02D";
      if (v < 0.8) return "#FB8C00";
      return "#C62828";
    },
  },
  ALERT: {
    title: "Alert Drought",
    stops: [
      { label: "Normal", range: "(0)", color: "#F9F6EE" },
      { label: "Watch", range: "(1)", color: "#fff9ae" },
      { label: "Alert", range: "(2)", color: "#F9A825" },
      { label: "Warning", range: "(3)", color: "#EF6C00" },
      { label: "Emergency", range: "(4)", color: "#C62828" },
    ],
    getColor: (v) => {
      if (!Number.isFinite(v)) return null;
      const k = Math.round(v);
      if (k <= 0) return "#F9F6EE";
      if (k === 1) return "#fff9ae";
      if (k === 2) return "#F9A825";
      if (k === 3) return "#EF6C00";
      return "#C62828";
    },
  },
};

function LegendBox({ indexKey, darkmode }) {
  const cfg = LEGENDS[indexKey];
  if (!cfg) return null;
  return (
    <div
      style={{
        width: "auto",
        background: darkmode ? "black" : "white",
        borderRadius: "5px",
        padding: "5px",
        color: darkmode ? "white" : "black",
        textAlign: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontWeight: 800,
          fontSize: 16,
          lineHeight: 1.2,
          marginBottom: 6,
        }}
      >
        {cfg.title}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          {cfg.stops.map((stop) => (
            <div
              key={stop.label}
              style={{
                width: "60px",
                height: "10px",
                borderRadius: "5px",
                backgroundColor: stop.color,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "6px",
          }}
        >
          {cfg.stops.map((stop) => (
            <div
              key={stop.label}
              style={{
                minWidth: "60px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                {stop.label}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  marginTop: "4px",
                  whiteSpace: "nowrap",
                }}
              >
                {stop.range}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const legendStops = [
  { value: -3, color: "#8B0000" },
  { value: -2, color: "#FF0000" },
  { value: -1, color: "#FF8C00" },
  { value: 0, color: "#FFD700" },
  { value: 1, color: "#00FF00" },
  { value: 2, color: "#0000FF" },
  { value: 3, color: "#00008B" },
];

const MONTH_WINDOW_OPTIONS = [
  { value: 1, label: "Month 1" },
  { value: 2, label: "Month 2" },
  { value: 3, label: "Month 3" },
  { value: 6, label: "Month 6" },
  { value: 12, label: "Month 12" },
  { value: 24, label: "Month 24" },
];

function classifyLegendBucket(indexKey, value) {
  if (!Number.isFinite(value)) return null;

  if (indexKey === "SPI") {
    if (value >= -0.5) return "Normal";
    if (value >= -1) return "Mild";
    if (value >= -1.5) return "Moderate";
    if (value >= -2) return "Severe";
    return "Extreme";
  }

  if (indexKey === "NSPI") {
    if (value < 0.5) return "Normal";
    if (value < 0.6) return "Mild";
    if (value < 0.7) return "Moderate";
    if (value < 0.8) return "High";
    return "Severe";
  }

  if (indexKey === "ALERT") {
    const k = Math.round(value);
    if (k <= 0) return "Normal";
    if (k === 1) return "Watch";
    if (k === 2) return "Alert";
    if (k === 3) return "Warning";
    return "Emergency";
  }

  return null;
}

function getLegendBuckets(indexKey) {
  if (indexKey === "SPI") return ["Normal", "Mild", "Moderate", "Severe", "Extreme"];
  if (indexKey === "NSPI") return ["Normal", "Mild", "Moderate", "High", "Severe"];
  if (indexKey === "ALERT") return ["Normal", "Watch", "Alert", "Warning", "Emergency"];
  return [];
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function interpolateColor(value) {
  const min = legendStops[0].value;
  const max = legendStops[legendStops.length - 1].value;
  const clamped = Math.max(min, Math.min(max, value));

  for (let i = 0; i < legendStops.length - 1; i += 1) {
    const left = legendStops[i];
    const right = legendStops[i + 1];
    if (clamped >= left.value && clamped <= right.value) {
      const ratio =
        right.value === left.value
          ? 0
          : (clamped - left.value) / (right.value - left.value);
      const leftRgb = hexToRgb(left.color);
      const rightRgb = hexToRgb(right.color);
      return {
        r: Math.round(leftRgb.r + ratio * (rightRgb.r - leftRgb.r)),
        g: Math.round(leftRgb.g + ratio * (rightRgb.g - leftRgb.g)),
        b: Math.round(leftRgb.b + ratio * (rightRgb.b - leftRgb.b)),
      };
    }
  }

  return hexToRgb(legendStops[legendStops.length - 1].color);
}

function getAttribute(variable, name) {
  return variable?.attributes?.find((attr) => attr.name === name)?.value;
}

function buildDateLabel(value, units) {
  if (!units || typeof units !== "string") return String(value);
  const parts = units.split(" ");
  const unitName = parts[0];
  const sinceIndex = parts.findIndex((part) => part.toLowerCase() === "since");
  const origin = sinceIndex >= 0 ? parts.slice(sinceIndex + 1).join(" ") : "";
  if (!origin) return String(value);
  const base = dayjs(origin);
  if (!base.isValid()) return String(value);
  if (unitName.includes("day")) {
    return base.add(Number(value), "day").format("YYYY-MM-DD");
  }
  if (unitName.includes("hour")) {
    return base.add(Number(value), "hour").format("YYYY-MM-DD HH:mm");
  }
  if (unitName.includes("month")) {
    return base.add(Number(value), "month").format("YYYY-MM-DD");
  }
  if (unitName.includes("year")) {
    return base.add(Number(value), "year").format("YYYY-MM-DD");
  }
  if (unitName.includes("min")) {
    return base.add(Number(value), "minute").format("YYYY-MM-DD HH:mm");
  }
  if (unitName.includes("sec")) {
    return base.add(Number(value), "second").format("YYYY-MM-DD HH:mm:ss");
  }
  return String(value);
}

const drawPakistanMask = (
  ctx,
  width,
  height,
  lonData,
  latData,
  geojson
) => {
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.beginPath();

  const lonAscending = lonData?.[0] < lonData?.[lonData.length - 1];
  const latAscending = latData?.[0] < latData?.[latData.length - 1];

  const toX = (lon) => {
    const lonN = normalizeLonToDataset(Number(lon), lonData);
    // lon/lat arrays typically store cell centers; canvas pixels are also cell areas.
    // Draw polygons in pixel-center coordinates to avoid a half-cell gap.
    return fractionalIndex(lonData, lonN, lonAscending) + 0.5;
  };
  const toY = (lat) => {
    const fi = fractionalIndex(latData, Number(lat), latAscending);
    return (latAscending ? height - 1 - fi : fi) + 0.5;
  };

  const drawRing = (ring) => {
    ring.forEach((coord, idx) => {
      const [lon, lat] = coord;
      const x = toX(lon);
      const y = toY(lat);
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
  };

  const drawPolygon = (polygon) => {
    polygon.forEach((ring) => drawRing(ring));
  };

  const features = Array.isArray(geojson?.features)
    ? geojson.features
    : geojson?.type === "Feature"
    ? [geojson]
    : geojson?.type && geojson?.coordinates
    ? [{ type: "Feature", properties: {}, geometry: geojson }]
    : [];

  features.forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry) return;
    if (geometry.type === "Polygon") {
      drawPolygon(geometry.coordinates);
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((polygon) => drawPolygon(polygon));
    }
  });

  ctx.fill("evenodd");
  ctx.restore();
};

function bufferBoundaryGeojson(geojson, bufferDegrees) {
  const dist = Number(bufferDegrees);
  if (!geojson || !Number.isFinite(dist) || dist <= 0) return geojson;
  try {
    return turfBuffer(geojson, dist, { units: "degrees" });
  } catch (error) {
    console.warn("[Forecast] Boundary buffer failed; using original boundary", error);
    return geojson;
  }
}

const buildGeojsonMaskAlpha = (
  width,
  height,
  lonData,
  latData,
  geojson
) => {
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const mctx = maskCanvas.getContext("2d");
  mctx.clearRect(0, 0, width, height);
  mctx.fillStyle = "rgba(0,0,0,1)";
  mctx.beginPath();

  const lonAscending = lonData?.[0] < lonData?.[lonData.length - 1];
  const latAscending = latData?.[0] < latData?.[latData.length - 1];

  const toX = (lon) => {
    const lonN = normalizeLonToDataset(Number(lon), lonData);
    return fractionalIndex(lonData, lonN, lonAscending) + 0.5;
  };
  const toY = (lat) => {
    const fi = fractionalIndex(latData, Number(lat), latAscending);
    return (latAscending ? height - 1 - fi : fi) + 0.5;
  };

  const drawRing = (ring) => {
    ring.forEach((coord, idx) => {
      const [lon, lat] = coord;
      const x = toX(lon);
      const y = toY(lat);
      if (idx === 0) {
        mctx.moveTo(x, y);
      } else {
        mctx.lineTo(x, y);
      }
    });
    mctx.closePath();
  };

  const drawPolygon = (polygon) => {
    polygon.forEach((ring) => drawRing(ring));
  };

  const features = Array.isArray(geojson?.features)
    ? geojson.features
    : geojson?.type === "Feature"
    ? [geojson]
    : geojson?.type && geojson?.coordinates
    ? [{ type: "Feature", properties: {}, geometry: geojson }]
    : [];

  features.forEach((feature) => {
    const geometry = feature?.geometry;
    if (!geometry) return;
    if (geometry.type === "Polygon") {
      drawPolygon(geometry.coordinates);
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((polygon) => drawPolygon(polygon));
    }
  });

  mctx.fill("evenodd");
  const data = mctx.getImageData(0, 0, width, height).data;
  const alpha = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i += 1) {
    alpha[i] = data[i * 4 + 3];
  }
  return alpha;
};

function NcRasterLayer({ raster }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !raster) return undefined;

    const overlay = L.imageOverlay(raster.dataUrl, raster.bounds, {
      opacity: raster.opacity,
      zIndex: 500,
    });

    overlay.addTo(map);
    map.fitBounds(raster.bounds, { maxZoom: 8 });

    return () => {
      map.removeLayer(overlay);
    };
  }, [map, raster]);

  return null;
}

function NcWmsLayer({ layer }) {
  const map = useMap();
  const wmsRef = useRef(null);

  useEffect(() => {
    if (!map || !layer?.layerName) return undefined;

    const workspace = layer.workspace || "PakDMS";
    const url = `../geoserver/${workspace}/wms`;
    const wms = L.tileLayer.wms(url, {
      layers: `${workspace}:${layer.layerName}`,
      format: "image/png",
      transparent: true,
      tiled: true,
      opacity: Number.isFinite(Number(layer.opacity)) ? Number(layer.opacity) : 1,
      zIndex: 500,
    });

    wms.addTo(map);
    wmsRef.current = wms;

    const b = layer.bounds4326;
    if (b && Number.isFinite(b.west) && Number.isFinite(b.south) && Number.isFinite(b.east) && Number.isFinite(b.north)) {
      map.fitBounds(
        [
          [b.south, b.west],
          [b.north, b.east],
        ],
        { maxZoom: 8 }
      );
    }

    return () => {
      try {
        map.removeLayer(wms);
      } catch (_) {
        // ignore
      }
      wmsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, layer?.workspace, layer?.layerName]);

  useEffect(() => {
    const wms = wmsRef.current;
    if (!wms) return;
    const op = Number.isFinite(Number(layer?.opacity)) ? Number(layer.opacity) : 1;
    wms.setOpacity(op);
  }, [layer?.opacity]);

  return null;
}

function findNearestIndex(values, target) {
  if (!values || values.length === 0) return -1;
  const first = values[0];
  const last = values[values.length - 1];
  const ascending = first < last;

  let low = 0;
  let high = values.length - 1;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    const v = values[mid];
    if (ascending ? v < target : v > target) {
      low = mid;
    } else {
      high = mid;
    }
  }
  const lowVal = values[low];
  const highVal = values[high];
  return Math.abs(lowVal - target) <= Math.abs(highVal - target) ? low : high;
}

function WmsValueOnClick({ layer }) {
  const map = useMapEvents({
    click: async (e) => {
      if (!layer?.layerName) return;
      try {
        const workspace = layer.workspace || "PakDMS";
        const baseUrl = `../geoserver/${workspace}/wms`;

        const size = map.getSize();
        const width = size.x;
        const height = size.y;

        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        // Use EPSG:3857 to match Leaflet default CRS.
        const crs = map.options.crs;
        const p1 = crs.project(L.latLng(sw.lat, sw.lng));
        const p2 = crs.project(L.latLng(ne.lat, ne.lng));
        const bbox = `${p1.x},${p1.y},${p2.x},${p2.y}`;

        const point = map.latLngToContainerPoint(e.latlng);
        const x = Math.round(point.x);
        const y = Math.round(point.y);

        const layerFullName = `${workspace}:${layer.layerName}`;
        const params = {
          SERVICE: "WMS",
          VERSION: "1.1.1",
          REQUEST: "GetFeatureInfo",
          LAYERS: layerFullName,
          QUERY_LAYERS: layerFullName,
          STYLES: "",
          BBOX: bbox,
          FEATURE_COUNT: 1,
          HEIGHT: height,
          WIDTH: width,
          FORMAT: "image/png",
          INFO_FORMAT: "application/json",
          SRS: "EPSG:3857",
          X: x,
          Y: y,
        };

        const url = new URL(baseUrl, window.location.href);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

        const resp = await fetch(url.toString());
        const json = await resp.json().catch(() => null);

        let valueText = "No data";
        if (json?.features?.length) {
          const props = json.features[0]?.properties || {};
          const keys = Object.keys(props);
          if (keys.length) {
            const v = props[keys[0]];
            valueText = Number.isFinite(Number(v)) ? Number(v).toFixed(4) : String(v);
          }
        }

        const content = `<div style="min-width:180px"><div><b>Value</b>: ${valueText}</div><div style="opacity:0.75">lat: ${e.latlng.lat.toFixed(4)}, lon: ${e.latlng.lng.toFixed(4)}</div></div>`;
        L.popup({ closeButton: true, autoClose: true })
          .setLatLng(e.latlng)
          .setContent(content)
          .openOn(map);
      } catch (_) {
        // ignore
      }
    },
  });

  return null;
}

function BoundaryOutlineLayer({ geojson, darkmode }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !geojson) return undefined;
    const paneName = "boundaryPane";
    if (!map.getPane(paneName)) {
      const pane = map.createPane(paneName);
      pane.style.zIndex = 650;
      pane.style.pointerEvents = "none";
    }

    const layer = L.geoJSON(geojson, {
      pane: paneName,
      style: {
        color: darkmode ? "#ffffff" : "#111111",
        weight: 2,
        opacity: 0.9,
        fill: false,
      },
    });

    layer.addTo(map);
    return () => {
      try {
        map.removeLayer(layer);
      } catch (_) {
        // ignore
      }
    };
  }, [map, geojson, darkmode]);

  return null;
}

function Forecast() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkmode, module, center, zoom, loggedin } = useSelector(
    (state) => state
  );

  const [api, contextHolder] = notification.useNotification();

  const [collapsed, setCollapsed] = useState(false);
  const [boundarySelect, setBoundarySelect] = useState(0);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [tehsilsLoading, setTehsilsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedTehsil, setSelectedTehsil] = useState(null);
  const [indicesExpanded, setIndicesExpanded] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState("SPI");
  const [selectedFile, setSelectedFile] = useState(null);
  const [timeOptions, setTimeOptions] = useState([]);
  const [selectedTime, setSelectedTime] = useState(0);
  const [selectedMonthWindow, setSelectedMonthWindow] = useState(1);
  const [opacity, setOpacity] = useState(0.85);
  const [loading, setLoading] = useState(false);
  const [renderLoading, setRenderLoading] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [wmsLayer, setWmsLayer] = useState(null);
  const [previousStoreName, setPreviousStoreName] = useState(null);
  const [pakistanGeojsonData, setPakistanGeojsonData] = useState(null);
  const [clipGeojsonData, setClipGeojsonData] = useState(null);
  const [coverageStats, setCoverageStats] = useState(null);
  const [statsOpen, setStatsOpen] = useState(false);

  const renderProgressRef = useRef(0);
  const renderProgressRafRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const [dateLabelPos, setDateLabelPos] = useState({ top: 50, left: 10 });
  const pendingDateRerenderRef = useRef(false);
  const activeForecastJobRef = useRef(null);

  const getdistricts = (features) => {
    let temp = [];
    (features || []).forEach((feat) => {
      temp.push({ value: feat.properties.name, label: feat.properties.name });
    });
    temp.sort(function (a, b) {
      if (a.value < b.value) return -1;
      if (a.value > b.value) return 1;
      return 0;
    });
    setDistricts(temp);
  };

  const gettehsils = (features) => {
    let temp = [];
    (features || []).forEach((feat) => {
      temp.push({ value: feat.properties.name, label: feat.properties.name });
    });
    temp.sort(function (a, b) {
      if (a.value < b.value) return -1;
      if (a.value > b.value) return 1;
      return 0;
    });
    setTehsils(temp);
  };

  const fileOptions = useMemo(() => {
    return classicOptionsByIndex[selectedIndex] || [];
  }, [selectedIndex]);

  const selectedFileName = useMemo(() => {
    const all = [
      ...(classicOptionsByIndex.SPI || []),
      ...(classicOptionsByIndex.NSPI || []),
      ...(classicOptionsByIndex.ALERT || []),
    ];
    const hit = all.find((o) => o.value === selectedFile);
    return hit?.meta?.filename || hit?.label || null;
  }, [selectedFile]);

  const selectedBoundaryLabel = useMemo(() => {
    if (selectedTehsil) return `Tehsil: ${selectedTehsil}`;
    if (selectedDistrict) return `District: ${selectedDistrict}`;
    if (selectedUnit) return `Province: ${selectedUnit}`;
    return "Boundary: Pakistan";
  }, [selectedUnit, selectedDistrict, selectedTehsil]);

  const monthWindowOptions = useMemo(() => {
    // NPSMI is a 1-month index; keep month selection fixed.
    if (selectedIndex === "NSPI") return [{ value: 1, label: "Month 1" }];
    return MONTH_WINDOW_OPTIONS;
  }, [selectedIndex]);

  const selectedTimeLabel = useMemo(() => {
    const match = (timeOptions || []).find(
      (o) => Number(o?.value) === Number(selectedTime)
    );
    return match?.label ?? null;
  }, [timeOptions, selectedTime]);

  const alertFileOption = useMemo(() => {
    const opts = classicOptionsByIndex.ALERT || [];
    // Prefer Alert_drought_classic.nc if available
    const preferred = opts.find((o) =>
      String(o.meta?.filename || "").toUpperCase().includes("ALERT_DROUGHT")
    );
    return preferred || opts[0] || null;
  }, []);

  useEffect(() => {
    if (module !== "forecast") {
      dispatch(setmodule("forecast"));
    }
  }, [dispatch, module]);

  useEffect(() => {
    if (selectedIndex === "NSPI" && selectedMonthWindow !== 1) {
      setSelectedMonthWindow(1);
    }
  }, [selectedIndex, selectedMonthWindow]);

  useEffect(() => {
    return () => {
      if (renderProgressRafRef.current) {
        cancelAnimationFrame(renderProgressRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const computeDatePos = () => {
      const wrapper = mapWrapperRef.current;
      if (!wrapper) return;
      const zoom = wrapper.querySelector(".leaflet-control-zoom");
      const wRect = wrapper.getBoundingClientRect();
      if (zoom) {
        const zRect = zoom.getBoundingClientRect();
        const left = Math.max(8, Math.round(zRect.right - wRect.left + 8));
        const top = Math.max(8, Math.round(zRect.top - wRect.top));
        setDateLabelPos({ top, left });
      } else {
        setDateLabelPos({ top: 50, left: 10 });
      }
    };

    computeDatePos();
    window.addEventListener("resize", computeDatePos);
    const observer = new MutationObserver(computeDatePos);
    if (mapWrapperRef.current) {
      observer.observe(mapWrapperRef.current, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener("resize", computeDatePos);
      observer.disconnect();
    };
  }, [collapsed, selectedTimeLabel, wmsLayer]);


  useEffect(() => {
    const loadGeojson = async () => {
      try {
        const response = await fetch(pakistanGeojsonUrl);
        const data = await response.json();
        setPakistanGeojsonData(data);
      } catch (error) {
        console.error(error);
        api.error({
          message: "Pakistan boundary failed",
          description: "Unable to load Pakistan GeoJSON boundary.",
          placement: "bottomRight",
        });
      }
    };

    loadGeojson();
  }, [api]);

  useEffect(() => {
    if (selectedIndex === "ALERT") {
      setSelectedFile(alertFileOption?.value ?? null);
      return;
    }

    if (fileOptions.length > 0) {
      const isStillValid = fileOptions.some((o) => o.value === selectedFile);
      if (!isStillValid) setSelectedFile(fileOptions[0].value);
    } else {
      setSelectedFile(null);
    }
  }, [selectedIndex, fileOptions, selectedFile, alertFileOption]);

  useEffect(() => {
    if (selectedIndex !== "SPI") return;
    if (!selectedMonthWindow) return;

    const desired = Number(selectedMonthWindow);
    const match = (fileOptions || []).find((o) => Number(o?.meta?.month) === desired);
    if (match?.value) {
      setSelectedFile(match.value);
      return;
    }

    // If the desired month file isn't available, keep the current selection.
    // We'll surface a gentle hint once to the user.
    api.warning({
      message: "Month not available",
      description: `No SPI file found for ${desired} month(s).`,
      placement: "bottomRight",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, selectedMonthWindow, fileOptions]);

  useEffect(() => {
    if (selectedIndex === "SPI") return;
    const desired = Math.max(1, Number(selectedMonthWindow) || 1);
    const idx = desired - 1;
    if (timeOptions.length > 0) {
      setSelectedTime(Math.max(0, Math.min(idx, timeOptions.length - 1)));
    } else {
      setSelectedTime(0);
    }
  }, [selectedIndex, selectedMonthWindow, timeOptions.length]);

  useEffect(() => {
    const hasSelection = !!(selectedTehsil || selectedDistrict || selectedUnit);
    if (!hasSelection) {
      setClipGeojsonData(null);
      return;
    }

    const fetchClip = async () => {
      try {
        let typeName = "PakDMS:units";
        let CQL_FILTER = null;

        if (selectedTehsil) {
          typeName = "PakDMS:tehsils";
          if (selectedDistrict) {
            CQL_FILTER = `district='${selectedDistrict}' AND name='${selectedTehsil}'`;
          } else {
            CQL_FILTER = `name='${selectedTehsil}'`;
          }
        } else if (selectedDistrict) {
          typeName = "PakDMS:districts";
          CQL_FILTER = `name='${selectedDistrict}'`;
        } else if (selectedUnit) {
          typeName = "PakDMS:units";
          CQL_FILTER = `name ILIKE '${selectedUnit}'`;
        }

        const resp = await Axios.get("../geoserver/ows", {
          params: {
            service: "WFS",
            version: "1.0.0",
            request: "GetFeature",
            typeName,
            outputFormat: "application/json",
            ...(CQL_FILTER ? { CQL_FILTER } : {}),
          },
        });

        const fc = resp?.data;
        if (fc && Array.isArray(fc.features) && fc.features.length > 0) {
          setClipGeojsonData(fc);
        } else {
          setClipGeojsonData(null);
        }
      } catch (e) {
        setClipGeojsonData(null);
      }
    };

    fetchClip();
  }, [selectedUnit, selectedDistrict, selectedTehsil]);

  useEffect(() => {
    if (!selectedFile) return;

    setWmsLayer(null);
    setRenderLoading(false);
    setRenderProgress(0);
    setCoverageStats(null);
    setStatsOpen(false);

    const loadMeta = async () => {
      setLoading(true);
      try {
        let assetPath = null;
        let assetUrl = null;
        try {
          const u = new URL(selectedFile, window.location.origin);
          if (u.origin === window.location.origin) {
            assetPath = u.pathname + u.search;
          } else {
            assetUrl = u.href;
          }
        } catch (_) {
          assetUrl = selectedFile;
        }

        const metaResp = await Axios.post("../python/forecast/meta", {
          params: { assetPath, assetUrl },
        });

        const labelsRaw = metaResp?.data?.timeLabels;
        const labels = Array.isArray(labelsRaw) ? labelsRaw : [];
        const cleaned = labels
          .filter((o) => o && Number.isFinite(Number(o.value)))
          .map((o) => {
            const raw = String(o.label ?? o.value);
            // Try parse with dayjs; if valid, format as date-only.
            const d = dayjs(raw);
            const label = d.isValid() ? d.format("YYYY-MM-DD") : raw.split(" ")[0];
            return { label: label, value: Number(o.value) };
          });

        setTimeOptions(cleaned.length ? cleaned : [{ label: "T1", value: 0 }]);
        setSelectedTime(0);
      } catch (error) {
        api.error({
          message: "NetCDF metadata failed",
          description: "Unable to read NetCDF metadata on server.",
          placement: "bottomRight",
        });
        setTimeOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadMeta();
  }, [selectedFile]);

  useEffect(() => {
    setWmsLayer((prev) => {
      if (!prev) return prev;
      if (Number(prev.opacity) === Number(opacity)) return prev;
      return { ...prev, opacity };
    });
  }, [opacity]);

  // When the user changes the Date (time index), refresh the raster immediately.
  // Keep Apply for initial render / other changes, but date changes should be instant.
  useEffect(() => {
    if (!wmsLayer) return;
    if (!selectedFile) return;
    if (!Array.isArray(timeOptions) || timeOptions.length === 0) return;

    if (renderLoading) {
      pendingDateRerenderRef.current = true;
      return;
    }

    pendingDateRerenderRef.current = false;
    buildRaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTime]);

  useEffect(() => {
    if (renderLoading) return;
    if (!pendingDateRerenderRef.current) return;
    if (!wmsLayer) return;
    pendingDateRerenderRef.current = false;
    buildRaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderLoading]);

  const buildRaster = async () => {
    if (!selectedFile) {
      api.info({
        message: "Select a NetCDF file",
        description: "Please select a NetCDF file first.",
        placement: "bottomRight",
      });
      return;
    }

    if (!pakistanGeojsonData) {
      api.info({
        message: "Boundary not loaded",
        description: "Pakistan boundary is still loading.",
        placement: "bottomRight",
      });
      return;
    }

    // Cancel any in-flight job (best-effort)
    try {
      if (activeForecastJobRef.current) {
        await Axios.post("../python/forecast/cancel", { params: { jobId: activeForecastJobRef.current } });
      }
    } catch (_) {
      // ignore
    }

    setRenderLoading(true);
    setRenderProgress(0);
    setCoverageStats(null);
    setStatsOpen(false);

    // Prefer a URL-based clip (small payload) instead of embedding full GeoJSON.
    let clipUrl = null;
    try {
      const hasSelection = !!(selectedTehsil || selectedDistrict || selectedUnit);
      if (hasSelection) {
        let typeName = "PakDMS:units";
        let CQL_FILTER = null;
        if (selectedTehsil) {
          typeName = "PakDMS:tehsils";
          if (selectedDistrict) {
            CQL_FILTER = `district='${selectedDistrict}' AND name='${selectedTehsil}'`;
          } else {
            CQL_FILTER = `name='${selectedTehsil}'`;
          }
        } else if (selectedDistrict) {
          typeName = "PakDMS:districts";
          CQL_FILTER = `name='${selectedDistrict}'`;
        } else if (selectedUnit) {
          typeName = "PakDMS:units";
          CQL_FILTER = `name ILIKE '${selectedUnit}'`;
        }

        const wfs = new URL("../geoserver/ows", window.location.href);
        wfs.searchParams.set("service", "WFS");
        wfs.searchParams.set("version", "1.0.0");
        wfs.searchParams.set("request", "GetFeature");
        wfs.searchParams.set("typeName", typeName);
        wfs.searchParams.set("outputFormat", "application/json");
        wfs.searchParams.set("srsName", "EPSG:4326");
        if (CQL_FILTER) wfs.searchParams.set("CQL_FILTER", CQL_FILTER);
        clipUrl = wfs.toString();
      } else {
        const pk = new URL(pakistanGeojsonUrl, window.location.origin);
        clipUrl = pk.toString();
      }
    } catch (_) {
      clipUrl = null;
    }

    let assetPath = null;
    let assetUrl = null;
    try {
      const u = new URL(selectedFile, window.location.origin);
      if (u.origin === window.location.origin) {
        assetPath = u.pathname + u.search;
      } else {
        assetUrl = u.href;
      }
    } catch (_) {
      assetUrl = selectedFile;
    }

    try {
      const startResp = await Axios.post("../python/forecast/apply", {
        params: {
          assetPath,
          assetUrl,
          timeIndex: Number(selectedTime) || 0,
          indexKey: selectedIndex,
          clipUrl,
          previousStoreName,
        },
      });

      const jobId = startResp?.data?.jobId;
      if (!jobId) throw new Error("No jobId returned by server");
      activeForecastJobRef.current = jobId;

      const startedAt = Date.now();
      // Poll job status
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const statusResp = await Axios.get(`../python/forecast/jobs/${jobId}`);
        const job = statusResp?.data;

        const pct = Number(job?.progress);
        if (Number.isFinite(pct)) setRenderProgress(pct);

        if (job?.status === "done") {
          const result = job?.result || {};
          const workspace = result.workspace || "PakDMS";
          const layerName = result.layerName;
          if (!layerName) throw new Error("Render finished without layerName");

          setPreviousStoreName(result.storeName || jobId);
          setWmsLayer({
            workspace,
            layerName,
            bounds4326: result.bounds4326 || null,
            opacity,
          });

          if (result.coverageStats) {
            setCoverageStats(result.coverageStats);
          }
          setRenderProgress(100);
          setRenderLoading(false);
          return;
        }

        if (job?.status === "error") {
          throw new Error(job?.error || "Server-side render failed");
        }

        if (Date.now() - startedAt > 10 * 60 * 1000) {
          throw new Error("Render timed out");
        }

        // Wait a bit before next poll
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 650));
      }
    } catch (e) {
      api.error({
        message: "Render failed",
        description: String(e?.message || e),
        placement: "bottomRight",
      });
      setRenderLoading(false);
    }
  };

  return (
    <Spin spinning={loading} tip="Loading ...">
      {contextHolder}
      <Layout style={{ padding: "0", margin: "0", height: "100vh" }}>
        <Header style={headerStyle}>
          <HeaderMap heading="Pakistan Drought Managament System" loggedin={loggedin} />
        </Header>
        <Layout hasSider>
          <Sider
            trigger={null}
            collapsedWidth="0"
            width={250}
            style={{
              textAlign: "center",
              color: "#fff",
              overflowY: "scroll",
              background: darkmode ? "#000" : "#fff",
              borderRight: "1px solid black",
            }}
            collapsible
            collapsed={collapsed}
          >
            <Space direction="vertical" size="small" style={{ display: "flex" }}>
              <div>
                <p className="sidebar-module">
                  <FontAwesomeIcon icon={faGrip} />
                  &nbsp;&nbsp;&nbsp;&nbsp;Module
                </p>
                <Select
                  showSearch
                  placeholder="Select a module"
                  optionFilterProp="children"
                  value={module}
                  onChange={(value) => {
                    dispatch(setmodule(value));
                    if (value === "monitoring") {
                      navigate("/map");
                    } else if (value === "forecast") {
                      navigate("/forecast");
                    }
                  }}
                  options={[
                    { value: "monitoring", label: "Drought Monitoring" },
                    { value: "forecast", label: "Forecast" },
                  ]}
                />
              </div>
              <div>
                <p className="sidebar-module">
                  <FontAwesomeIcon icon={faListOl} />
                  &nbsp;&nbsp;&nbsp;&nbsp;Selection Type
                </p>
                <Radio.Group
                  onChange={(e) => setBoundarySelect(e.target.value)}
                  value={boundarySelect}
                >
                  <Space direction="vertical">
                    <Radio value={0}>Interactive</Radio>
                    <Radio value={1}>Upload</Radio>
                    <Radio value={2}>Draw</Radio>
                  </Space>
                </Radio.Group>
              </div>

              <div>
                <p className="sidebar-module">
                  <FontAwesomeIcon icon={faLayerGroup} />
                  &nbsp;&nbsp;&nbsp;&nbsp;Region
                </p>

                <Select
                  allowClear
                  showSearch
                  placeholder="Select a province"
                  optionFilterProp="label"
                  value={selectedUnit}
                  onChange={(value) => {
                    setSelectedUnit(value || null);
                    setSelectedDistrict(null);
                    setSelectedTehsil(null);
                    setDistricts([]);
                    setTehsils([]);

                    if (!value) return;
                    setDistrictsLoading(true);
                    Axios.get("../geoserver/ows", {
                      params: {
                        service: "WFS",
                        version: "1.0.0",
                        request: "GetFeature",
                        typeName: "PakDMS:districts",
                        outputFormat: "application/json",
                        CQL_FILTER: `unit='${value}'`,
                      },
                    })
                      .then((resp) => {
                        const feats = resp?.data?.features || [];
                        getdistricts(feats);
                      })
                      .catch(() => {
                        setDistricts([]);
                      })
                      .finally(() => {
                        setDistrictsLoading(false);
                      });
                  }}
                  options={[
                    { value: "AZAD KASHMIR", label: "AZAD KASHMIR" },
                    { value: "BALOCHISTAN", label: "BALOCHISTAN" },
                    { value: "GILGIT BALTISTAN", label: "GILGIT BALTISTAN" },
                    {
                      value: "FEDERAL CAPITAL TERRITORY",
                      label: "FEDERAL CAPITAL TERRITORY",
                    },
                    {
                      value: "KHYBER PAKHTUNKHWA",
                      label: "KHYBER PAKHTUNKHWA",
                    },
                    { value: "PUNJAB", label: "PUNJAB" },
                    { value: "SINDH", label: "SINDH" },
                  ]}
                />

                {selectedUnit ? (
                  <div style={{ marginTop: 10 }}>
                    <Select
                      allowClear
                      showSearch
                      placeholder="Select a district"
                      optionFilterProp="label"
                      loading={districtsLoading}
                      value={selectedDistrict}
                      options={districts}
                      onChange={(value) => {
                        setSelectedDistrict(value || null);
                        setSelectedTehsil(null);
                        setTehsils([]);

                        if (!value) return;
                        setTehsilsLoading(true);
                        Axios.get("../geoserver/ows", {
                          params: {
                            service: "WFS",
                            version: "1.0.0",
                            request: "GetFeature",
                            typeName: "PakDMS:tehsils",
                            outputFormat: "application/json",
                            CQL_FILTER: `district='${value}'`,
                          },
                        })
                          .then((resp) => {
                            const feats = resp?.data?.features || [];
                            gettehsils(feats);
                          })
                          .catch(() => {
                            setTehsils([]);
                          })
                          .finally(() => {
                            setTehsilsLoading(false);
                          });
                      }}
                    />
                  </div>
                ) : null}

                {selectedDistrict ? (
                  <div style={{ marginTop: 10 }}>
                    <Select
                      allowClear
                      showSearch
                      placeholder="Select a tehsil"
                      optionFilterProp="label"
                      loading={tehsilsLoading}
                      value={selectedTehsil}
                      options={tehsils}
                      onChange={(value) => {
                        setSelectedTehsil(value || null);
                      }}
                    />
                  </div>
                ) : null}
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    userSelect: "none",
                    padding: "2px 0",
                  }}
                  onClick={() => setIndicesExpanded((v) => !v)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FontAwesomeIcon
                      icon={indicesExpanded ? faChevronDown : faChevronRight}
                      style={{ color: darkmode ? "#fff" : "#000" }}
                    />
                    <span
                      style={{
                        fontWeight: 700,
                        color: darkmode ? "#fff" : "#1a5cff",
                      }}
                    >
                      Indices
                    </span>
                  </div>
                  <FontAwesomeIcon
                    icon={faListOl}
                    style={{ opacity: 0.8, color: darkmode ? "#fff" : "#000" }}
                  />
                </div>

                {indicesExpanded ? (
                  <>
                    <Divider style={{ margin: "8px 0" }} />
                    <List
                      size="small"
                      bordered
                      dataSource={[
                        { key: "SPI", title: "SPI" },
                        { key: "NSPI", title: "NPSMI" },
                      ]}
                      renderItem={(item) => (
                        <List.Item
                          style={{
                            cursor: "pointer",
                            fontWeight: selectedIndex === item.key ? 800 : 600,
                            color: darkmode ? "#fff" : "#000",
                            background:
                              selectedIndex === item.key
                                ? "rgba(92,64,51,0.10)"
                                : "transparent",
                          }}
                          onClick={() => {
                            setSelectedIndex(item.key);
                            setWmsLayer(null);
                            setRenderProgress(0);
                          }}
                        >
                          {item.title}
                        </List.Item>
                      )}
                    />
                  </>
                ) : null}

                <Divider style={{ margin: "10px 0" }} />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    userSelect: "none",
                    fontWeight: selectedIndex === "ALERT" ? 800 : 700,
                    color: darkmode ? "#fff" : "#000",
                    padding: "2px 0",
                  }}
                  onClick={() => {
                    setSelectedIndex("ALERT");
                    setWmsLayer(null);
                    setRenderProgress(0);
                  }}
                >
                  <span>Alert</span>
                </div>

                <Divider style={{ margin: "10px 0 6px" }} />
                {selectedIndex === "SPI" ? (
                  <>
                    <div style={{ textAlign: "left", fontSize: 12, marginBottom: 6 }}>
                      Month
                    </div>
                    <Select
                      placeholder="Select Month"
                      value={selectedMonthWindow}
                      onChange={(value) => setSelectedMonthWindow(value)}
                      options={monthWindowOptions}
                    />
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: "left", fontSize: 12, marginBottom: 6 }}>
                      Month
                    </div>
                    <Select
                      placeholder="Select Month"
                      value={selectedMonthWindow}
                      onChange={(value) => setSelectedMonthWindow(value)}
                      options={monthWindowOptions}
                    />
                  </>
                )}

                {/* Date selector moved onto the map (next to Date label). */}
              </div>

              <div style={{ textAlign: "left" }}>
                <Divider style={{ margin: "10px 0 8px" }} />
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4, color: darkmode ? "#fff" : "#000" }}>
                  {selectedBoundaryLabel}
                </div>
                {selectedUnit || selectedDistrict || selectedTehsil ? (
                  <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 4, color: darkmode ? "#fff" : "#000" }}>
                    {selectedUnit ? `Province: ${selectedUnit}` : null}
                    {selectedDistrict ? `  |  District: ${selectedDistrict}` : null}
                    {selectedTehsil ? `  |  Tehsil: ${selectedTehsil}` : null}
                  </div>
                ) : null}
              </div>
              <div>
                <p className="sidebar-module">Opacity</p>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={(value) => setOpacity(value)}
                />
              </div>
              <Space>
                <Button
                  icon={<FontAwesomeIcon icon={faLayerGroup} />}
                  onClick={buildRaster}
                  disabled={
                    !selectedFile ||
                    ((selectedIndex === "ALERT" || selectedIndex === "NSPI") &&
                      timeOptions.length === 0)
                  }
                >
                  Apply
                </Button>
                <Button
                  disabled={!coverageStats}
                  onClick={() => {
                    if (!coverageStats) return;
                    setStatsOpen((v) => !v);
                  }}
                >
                  Stats
                </Button>
              </Space>
            </Space>
          </Sider>
          <Content style={contentStyle}>
            <div ref={mapWrapperRef} style={{ position: "relative", height: "100%" }}>
              <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
                <Button
                  icon={
                    collapsed ? (
                      <FontAwesomeIcon icon={faAnglesRight} />
                    ) : (
                      <FontAwesomeIcon icon={faAnglesLeft} />
                    )
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ fontSize: "16px" }}
                />
              </div>

              {selectedFile ? (
                <div
                  style={{
                    position: "absolute",
                    top: dateLabelPos.top,
                    left: dateLabelPos.left,
                    zIndex: 1000,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    padding: "6px 10px",
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    maxWidth: 360,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ whiteSpace: "nowrap" }}>Date:</span>
                    <Select
                      showSearch
                      placeholder="Select Date"
                      optionFilterProp="label"
                      value={selectedTime}
                      onChange={(value) => setSelectedTime(value)}
                      options={timeOptions}
                      disabled={!Array.isArray(timeOptions) || timeOptions.length === 0}
                      size="small"
                      style={{ minWidth: 170 }}
                      dropdownMatchSelectWidth={false}
                      getPopupContainer={(trigger) => trigger.parentNode}
                    />
                  </div>
                </div>
              ) : null}
              {(loading || renderLoading) && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 1000,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontWeight: 600,
                  }}
                >
                  {loading
                    ? "Loading NetCDF..."
                    : `Loading ${renderProgress}%`}
                </div>
              )}
              <MapContainer
                center={center}
                zoom={zoom}
                className="map-container"
                maxZoom={27}
              >
              <AddMask
                selectedUnit={selectedUnit}
                selectedDistrict={selectedDistrict}
                selectedTehsil={selectedTehsil}
              />
              <BoundaryOutlineLayer
                geojson={clipGeojsonData || pakistanGeojsonData}
                darkmode={darkmode}
              />
              <WmsValueOnClick layer={wmsLayer} />
              <LayersControl position="topleft">
                <LayersControl.BaseLayer
                  name="Google Satellite"
                  checked={false}
                >
                  <LayerGroup name="Google Satellite">
                    <TileLayer
                      maxZoom={27}
                      url="https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
                    />
                    <TileLayer
                      maxZoom={27}
                      url="https://mt0.google.com/vt/lyrs=h&hl=en&x={x}&y={y}&z={z}"
                    />
                  </LayerGroup>
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Google Maps">
                  <TileLayer
                    name="Google Maps"
                    maxZoom={27}
                    url="https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer
                  name="Carto Dark"
                  checked={!darkmode ? false : true}
                >
                  <TileLayer
                    name="Carto Dark"
                    maxZoom={20}
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    className="map-tiles"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="ESRI NatGeo" checked={false}>
                  <TileLayer
                    name="ESRI NatGeo"
                    maxZoom={16}
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
                    className="map-tiles"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer
                  name="ESRI World Imagery"
                  checked={darkmode ? false : true}
                >
                  <TileLayer
                    name="ESRI World Imagery"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    className="map-tiles"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Open Topomap" checked={false}>
                  <TileLayer
                    name="Open Topomap"
                    maxZoom={17}
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    className="map-tiles"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>
              {wmsLayer ? <NcWmsLayer layer={wmsLayer} /> : null}
              </MapContainer>

              {wmsLayer ? (
                <div
                  style={{
                    width: "auto",
                    position: "fixed",
                    bottom: "15px",
                    right: "15px",
                    zIndex: 5000,
                  }}
                >
                  <LegendBox indexKey={selectedIndex} darkmode={darkmode} />
                </div>
              ) : null}

              {wmsLayer && coverageStats && statsOpen ? (
                <div
                  style={{
                    position: "fixed",
                    right: "15px",
                    top: "120px",
                    zIndex: 5000,
                    width: 280,
                    background: darkmode ? "black" : "white",
                    color: darkmode ? "white" : "black",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                    border: darkmode ? "1px solid #333" : "1px solid #ddd",
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>
                    Stats
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 10, opacity: 0.9 }}>
                    Total inside clip: <b>{coverageStats.totalInside}</b>
                    <br />
                    Valid pixels: <b>{coverageStats.totalValid}</b>
                  </div>
                  <div>
                    {coverageStats.items.map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          marginBottom: 6,
                          fontSize: 12,
                        }}
                      >
                        <span>{row.label}</span>
                        <span>
                          {row.pct.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Spin>
  );
}

export default Forecast;
