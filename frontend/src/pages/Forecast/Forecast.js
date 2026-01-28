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
import NetCDFReader from "netcdfjs";
import Axios from "axios";

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

const classicNcContext = require.context(
  "../../ncreader/nc_files",
  false,
  /_classic\.nc$/
);

function parseMonthFromFilename(filename) {
  const match = filename.match(/\.(\d{2})M(?:_classic)?\.nc$/i);
  if (!match) return null;
  const month = Number(match[1]);
  return Number.isFinite(month) ? month : null;
}

function buildClassicFileOptionsByIndex() {
  const files = classicNcContext.keys().map((key) => {
    const filename = key.replace(/^\.\//, "");
    const url = classicNcContext(key);
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
  // Prefer the Alert_drought_classic.nc variant when multiple exist.
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

const classicOptionsByIndex = buildClassicFileOptionsByIndex();

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
      { label: "Normal", range: "(0 to 0.5)", color: "#1E5BFF" },
      { label: "Mild", range: "(0.5 to 0.6)", color: "#00C7D4" },
      { label: "Moderate", range: "(0.6 to 0.7)", color: "#F4D03F" },
      { label: "High", range: "(0.7 to 0.8)", color: "#F39C12" },
      { label: "Severe", range: "(0.8+)", color: "#E74C3C" },
    ],
    getColor: (v) => {
      if (!Number.isFinite(v)) return null;
      if (v < 0.5) return "#1E5BFF";
      if (v < 0.6) return "#00C7D4";
      if (v < 0.7) return "#F4D03F";
      if (v < 0.8) return "#F39C12";
      return "#E74C3C";
    },
  },
  ALERT: {
    title: "Alert Drought",
    stops: [
      { label: "Normal", range: "(0)", color: "#1E5BFF" },
      { label: "Watch", range: "(1)", color: "#00C7D4" },
      { label: "Alert", range: "(2)", color: "#F4D03F" },
      { label: "Warning", range: "(3)", color: "#F39C12" },
      { label: "Emergency", range: "(4)", color: "#E74C3C" },
    ],
    getColor: (v) => {
      if (!Number.isFinite(v)) return null;
      const k = Math.round(v);
      if (k <= 0) return "#1E5BFF";
      if (k === 1) return "#00C7D4";
      if (k === 2) return "#F4D03F";
      if (k === 3) return "#F39C12";
      return "#E74C3C";
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
  lonMin,
  lonMax,
  latMin,
  latMax,
  geojson
) => {
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.beginPath();

  const drawRing = (ring) => {
    ring.forEach((coord, idx) => {
      const [lon, lat] = coord;
      const x = ((lon - lonMin) / (lonMax - lonMin)) * (width - 1);
      const y = ((latMax - lat) / (latMax - latMin)) * (height - 1);
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

  geojson.features.forEach((feature) => {
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

const buildGeojsonMaskAlpha = (
  width,
  height,
  lonMin,
  lonMax,
  latMin,
  latMax,
  geojson
) => {
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const mctx = maskCanvas.getContext("2d");
  mctx.clearRect(0, 0, width, height);
  mctx.fillStyle = "rgba(0,0,0,1)";
  mctx.beginPath();

  const drawRing = (ring) => {
    ring.forEach((coord, idx) => {
      const [lon, lat] = coord;
      const x = ((lon - lonMin) / (lonMax - lonMin)) * (width - 1);
      const y = ((latMax - lat) / (latMax - latMin)) * (height - 1);
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

  (geojson?.features || []).forEach((feature) => {
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

function NcValueOnClick({ ncMetaRef, selectedTime }) {
  const map = useMapEvents({
    click: (e) => {
      const meta = ncMetaRef?.current;
      if (!meta) return;
      const {
        dataVar,
        dataValues,
        latData,
        lonData,
        dimensionSizes,
        latDimId,
        lonDimId,
        timeDimId,
        dataUnits,
      } = meta;

      if (!dataVar || !dataValues || !latData || !lonData) return;
      const dims = Array.isArray(dataVar.dimensions) ? dataVar.dimensions : [];
      const latPos = latDimId == null ? -1 : dims.indexOf(latDimId);
      const lonPos = lonDimId == null ? -1 : dims.indexOf(lonDimId);
      const timePos = timeDimId == null ? -1 : dims.indexOf(timeDimId);
      if (latPos < 0 || lonPos < 0) return;

      const strides = dimensionSizes.map((_, index) => {
        return dimensionSizes.slice(index + 1).reduce((acc, val) => acc * val, 1);
      });

      const latIndex = findNearestIndex(latData, e.latlng.lat);
      const lonIndex = findNearestIndex(lonData, e.latlng.lng);
      if (latIndex < 0 || lonIndex < 0) return;

      const timeSize = timePos >= 0 ? dimensionSizes[timePos] : 1;
      const timeIndexSafe =
        timePos >= 0
          ? Math.max(0, Math.min(Number(selectedTime) || 0, timeSize - 1))
          : 0;

      const indices = new Array(dims.length).fill(0);
      if (timePos >= 0) indices[timePos] = timeIndexSafe;
      indices[latPos] = latIndex;
      indices[lonPos] = lonIndex;

      const dataIndex = indices.reduce((acc, idx, i) => acc + idx * strides[i], 0);
      const rawValue = dataValues?.[dataIndex];

      const scaleFactorRaw = getAttribute(dataVar, "scale_factor");
      const addOffsetRaw = getAttribute(dataVar, "add_offset");
      const scaleFactor = Number.isFinite(Number(scaleFactorRaw))
        ? Number(scaleFactorRaw)
        : 1;
      const addOffset = Number.isFinite(Number(addOffsetRaw)) ? Number(addOffsetRaw) : 0;
      const fillValue = getAttribute(dataVar, "_FillValue");
      const missingValue = getAttribute(dataVar, "missing_value");

      const matchesFill = (raw, fill) => {
        if (fill === undefined || fill === null) return false;
        if (Array.isArray(fill)) return fill.includes(raw);
        if (ArrayBuffer.isView(fill) && typeof fill.length === "number") {
          if (fill.length === 1) return raw === fill[0];
        }
        return raw === fill;
      };

      const rawIsFill =
        matchesFill(rawValue, fillValue) || matchesFill(rawValue, missingValue);
      const value = rawIsFill
        ? Number.NaN
        : Number(rawValue) * scaleFactor + addOffset;

      const content = Number.isFinite(value)
        ? `<div style="min-width:180px"><div><b>Value</b>: ${value.toFixed(4)}${
            dataUnits ? ` (${String(dataUnits)})` : ""
          }</div><div style="opacity:0.75">lat: ${e.latlng.lat.toFixed(
            4
          )}, lon: ${e.latlng.lng.toFixed(4)}</div></div>`
        : `<div style="min-width:180px"><b>No data</b><div style="opacity:0.75">lat: ${e.latlng.lat.toFixed(
            4
          )}, lon: ${e.latlng.lng.toFixed(4)}</div></div>`;

      L.popup({ closeButton: true, autoClose: true })
        .setLatLng(e.latlng)
        .setContent(content)
        .openOn(map);
    },
  });

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
  const [raster, setRaster] = useState(null);
  const [pakistanGeojsonData, setPakistanGeojsonData] = useState(null);
  const [clipGeojsonData, setClipGeojsonData] = useState(null);
  const [coverageStats, setCoverageStats] = useState(null);
  const [statsOpen, setStatsOpen] = useState(false);

  const ncMetaRef = useRef(null);
  const renderProgressRef = useRef(0);
  const renderProgressRafRef = useRef(null);
  const mapWrapperRef = useRef(null);
  const [dateLabelPos, setDateLabelPos] = useState({ top: 50, left: 10 });

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
  }, [collapsed, selectedTimeLabel, raster]);

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
          CQL_FILTER = `name='${selectedUnit}'`;
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

    setRaster(null);
    setRenderLoading(false);
    setRenderProgress(0);

    const loadFile = async () => {
      setLoading(true);
      try {
        const response = await fetch(selectedFile);
        const arrayBuffer = await response.arrayBuffer();
        const magic = String.fromCharCode(
          ...new Uint8Array(arrayBuffer.slice(0, 3))
        );
        if (magic !== "CDF") {
          api.error({
            message: "Unsupported NetCDF format",
            description:
              "This file is not NetCDF v3 (CDF). Please select a *_classic.nc file.",
            placement: "bottomRight",
          });
          ncMetaRef.current = null;
          setTimeOptions([]);
          return;
        }
        const reader = new NetCDFReader(arrayBuffer);

        const variables = reader.variables || [];
        const dimensions = reader.dimensions || [];

        const getDimName = (dimId) =>
          String(dimensions?.[Number(dimId)]?.name ?? "");

        const getScalarDimId = (variable) => {
          const dimIds = variable?.dimensions;
          if (!Array.isArray(dimIds) || dimIds.length === 0) return null;
          return Number(dimIds[0]);
        };

        const findVar = (candidates) =>
          variables.find((variable) => {
            const name = String(variable?.name || "").toLowerCase();
            return candidates.some((candidate) => name.includes(candidate));
          });

        const latVar = findVar(["lat", "latitude", "y"]);
        const lonVar = findVar(["lon", "longitude", "x"]);
        const timeVar = findVar(["time"]);

        const latDimId = getScalarDimId(latVar);
        const lonDimId = getScalarDimId(lonVar);
        const timeDimId = getScalarDimId(timeVar);

        const isCoordVarName = (name) =>
          [latVar?.name, lonVar?.name, timeVar?.name].includes(name);

        const isDataVarCandidate = (variable) => {
          if (!variable || isCoordVarName(variable.name)) return false;
          if (!Array.isArray(variable.dimensions) || variable.dimensions.length < 2)
            return false;
          if (variable.type === "char") return false;
          if (latDimId == null || lonDimId == null) return false;
          return (
            variable.dimensions.includes(latDimId) &&
            variable.dimensions.includes(lonDimId)
          );
        };

        const dataVar =
          variables.find(isDataVarCandidate) ||
          variables.find((variable) => {
            if (!variable || isCoordVarName(variable.name)) return false;
            return Array.isArray(variable.dimensions) &&
              variable.dimensions.length >= 2 &&
              variable.type !== "char";
          });

        if (!latVar || !lonVar || !dataVar) {
          throw new Error("Unable to locate lat/lon or data variables.");
        }

        const latData = reader.getDataVariable(latVar.name);
        const lonData = reader.getDataVariable(lonVar.name);
        if (!latData?.length || !lonData?.length) {
          throw new Error("Lat/Lon arrays are missing or empty.");
        }
        const timeData = timeVar ? reader.getDataVariable(timeVar.name) : [0];

        const dataValues = reader.getDataVariable(dataVar.name);
        const dimensionSizes = (dataVar.dimensions || []).map((dimId) => {
          const dim = dimensions?.[Number(dimId)];
          return dim?.size ?? 0;
        });

        const timeUnits = timeVar?.attributes?.find(
          (attr) => attr.name === "units"
        )?.value;
        const dataUnits = getAttribute(dataVar, "units");

        ncMetaRef.current = {
          dataVar,
          dataValues,
          latData,
          lonData,
          timeData,
          dimensionSizes,
          latDimId,
          lonDimId,
          timeDimId,
          timeUnits,
          dataUnits,
        };

        // Helpful debug info (keep lightweight)
        try {
          // eslint-disable-next-line no-console
          console.log("[Forecast] NetCDF vars:", {
            latVar: latVar?.name,
            lonVar: lonVar?.name,
            timeVar: timeVar?.name,
            dataVar: dataVar?.name,
            dataDims: (dataVar?.dimensions || []).map((id) => ({
              id,
              name: getDimName(id),
              size: dimensions?.[Number(id)]?.size,
            })),
          });
        } catch (_) {
          // ignore
        }

        const timeArray = Array.from(timeData || []);
        const timeLabels = timeArray.map((value, index) => {
          const dateLabel = buildDateLabel(value, timeUnits);
          const label = dateLabel && dateLabel !== String(value)
            ? dateLabel
            : `T${index + 1}`;
          return { label, value: index };
        });

        setTimeOptions(timeLabels);
        setSelectedTime(0);
      } catch (error) {
        console.error(error);
        api.error({
          message: "NetCDF read failed",
          description:
            "Unable to read this NetCDF file. Please use a NetCDF v3 (classic) file.",
          placement: "bottomRight",
        });
        setTimeOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [selectedFile]);

  useEffect(() => {
    if (!raster) return;
    setRaster((prev) => (prev ? { ...prev, opacity } : prev));
  }, [opacity]);

  const buildRaster = () => {
    if (!ncMetaRef.current) {
      api.info({
        message: "Select a valid NetCDF file",
        description: "Please load a NetCDF v3 (classic) file first.",
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

    setRenderLoading(true);
    setRenderProgress(0);
    setCoverageStats(null);
    setStatsOpen(false);

    const {
      dataVar,
      dataValues,
      latData,
      lonData,
      dimensionSizes,
      dataUnits,
      latDimId,
      lonDimId,
      timeDimId,
    } = ncMetaRef.current;

    const latLength = latData.length;
    const lonLength = lonData.length;
    const latAscending = latData[0] < latData[latLength - 1];

    const dims = Array.isArray(dataVar.dimensions) ? dataVar.dimensions : [];
    if (!dims.length) {
      api.error({
        message: "Invalid NetCDF variable",
        description: "Data variable has no dimensions.",
        placement: "bottomRight",
      });
      setRenderLoading(false);
      return;
    }

    const latPos = latDimId == null ? -1 : dims.indexOf(latDimId);
    const lonPos = lonDimId == null ? -1 : dims.indexOf(lonDimId);
    const timePos = timeDimId == null ? -1 : dims.indexOf(timeDimId);

    if (latPos < 0 || lonPos < 0) {
      api.error({
        message: "Unsupported grid",
        description:
          "Unable to match data variable dimensions with lat/lon dimensions.",
        placement: "bottomRight",
      });
      setRenderLoading(false);
      return;
    }

    const strides = dimensionSizes.map((_, index) => {
      return dimensionSizes.slice(index + 1).reduce((acc, val) => acc * val, 1);
    });

    const canvas = document.createElement("canvas");
    canvas.width = lonLength;
    canvas.height = latLength;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(lonLength, latLength);

    const lonMin = Math.min(...lonData);
    const lonMax = Math.max(...lonData);
    const latMin = Math.min(...latData);
    const latMax = Math.max(...latData);
    const clipGeojson = clipGeojsonData || pakistanGeojsonData;
    const clipAlpha = buildGeojsonMaskAlpha(
      lonLength,
      latLength,
      lonMin,
      lonMax,
      latMin,
      latMax,
      clipGeojson
    );

    const scaleFactorRaw = getAttribute(dataVar, "scale_factor");
    const addOffsetRaw = getAttribute(dataVar, "add_offset");
    const scaleFactor = Number.isFinite(Number(scaleFactorRaw))
      ? Number(scaleFactorRaw)
      : 1;
    const addOffset = Number.isFinite(Number(addOffsetRaw))
      ? Number(addOffsetRaw)
      : 0;
    const fillValue = getAttribute(dataVar, "_FillValue");
    const missingValue = getAttribute(dataVar, "missing_value");
    const validMinRaw = getAttribute(dataVar, "valid_min");
    const validMaxRaw = getAttribute(dataVar, "valid_max");
    const validMin = Number.isFinite(Number(validMinRaw))
      ? Number(validMinRaw)
      : undefined;
    const validMax = Number.isFinite(Number(validMaxRaw))
      ? Number(validMaxRaw)
      : undefined;

    const matchesFill = (raw, fill) => {
      if (fill === undefined || fill === null) return false;
      if (Array.isArray(fill)) return fill.includes(raw);
      if (ArrayBuffer.isView(fill) && typeof fill.length === "number") {
        if (fill.length === 1) return raw === fill[0];
      }
      return raw === fill;
    };

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    const buckets = getLegendBuckets(selectedIndex);
    const bucketCounts = buckets.reduce((acc, k) => {
      acc[k] = 0;
      return acc;
    }, {});
    let noDataCount = 0;
    let totalInside = 0;
    let totalValid = 0;

    const progressStep = Math.max(1, Math.floor(latLength / 50));
    const updateProgress = (value) => {
      renderProgressRef.current = value;
      if (renderProgressRafRef.current) return;
      renderProgressRafRef.current = requestAnimationFrame(() => {
        setRenderProgress(renderProgressRef.current);
        renderProgressRafRef.current = null;
      });
    };

    const lonAscending = lonData[0] < lonData[lonLength - 1];
    const timeSize = timePos >= 0 ? dimensionSizes[timePos] : 1;
    const timeIndexSafe =
      timePos >= 0
        ? Math.max(0, Math.min(Number(selectedTime) || 0, timeSize - 1))
        : 0;

    for (let y = 0; y < latLength; y += 1) {
      const latIndex = latAscending ? latLength - 1 - y : y;
      for (let x = 0; x < lonLength; x += 1) {
        const pix = y * lonLength + x;
        const inside = clipAlpha[pix] > 0;
        const lonIndex = lonAscending ? x : lonLength - 1 - x;

        const indices = new Array(dims.length).fill(0);
        if (timePos >= 0) indices[timePos] = timeIndexSafe;
        indices[latPos] = latIndex;
        indices[lonPos] = lonIndex;

        const dataIndex = indices.reduce(
          (acc, idx, i) => acc + idx * strides[i],
          0
        );
        const rawValue = dataValues?.[dataIndex];

        const rawIsFill =
          matchesFill(rawValue, fillValue) || matchesFill(rawValue, missingValue);
        const scaledValue = rawIsFill
          ? Number.NaN
          : Number(rawValue) * scaleFactor + addOffset;

        const isValidRange =
          (validMin === undefined || scaledValue >= validMin) &&
          (validMax === undefined || scaledValue <= validMax);
        const isValid =
          Number.isFinite(scaledValue) &&
          Math.abs(scaledValue) < 1e20 &&
          isValidRange;

        if (isValid) {
          min = Math.min(min, scaledValue);
          max = Math.max(max, scaledValue);
        }

        const index = (y * lonLength + x) * 4;
        if (!inside) {
          imageData.data[index] = 0;
          imageData.data[index + 1] = 0;
          imageData.data[index + 2] = 0;
          imageData.data[index + 3] = 0;
          continue;
        }

        totalInside += 1;

        if (isValid) {
          const cfg = LEGENDS[selectedIndex];
          const colorHex = cfg?.getColor ? cfg.getColor(scaledValue) : null;
          const { r, g, b } = colorHex ? hexToRgb(colorHex) : interpolateColor(scaledValue);
          imageData.data[index] = r;
          imageData.data[index + 1] = g;
          imageData.data[index + 2] = b;
          imageData.data[index + 3] = Math.round(opacity * 255);

          totalValid += 1;
          const bucket = classifyLegendBucket(selectedIndex, scaledValue);
          if (bucket && bucketCounts[bucket] !== undefined) {
            bucketCounts[bucket] += 1;
          }
        } else {
          imageData.data[index] = 0;
          imageData.data[index + 1] = 0;
          imageData.data[index + 2] = 0;
          imageData.data[index + 3] = 0;
          noDataCount += 1;
        }
      }

      if (y % progressStep === 0) {
        updateProgress(10 + Math.round((y / latLength) * 90));
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Apply an anti-aliased clip mask for cleaner edges
    drawPakistanMask(ctx, lonLength, latLength, lonMin, lonMax, latMin, latMax, clipGeojson);

    const bounds = [
      [latMin, lonMin],
      [latMax, lonMax],
    ];

    setRaster({
      dataUrl: canvas.toDataURL("image/png"),
      bounds,
      opacity,
      stats: {
        min: Number.isFinite(min) ? min : null,
        max: Number.isFinite(max) ? max : null,
        units: dataUnits || "",
      },
    });

    const coverageItems = buckets.map((label) => {
      const count = Number(bucketCounts[label] || 0);
      const pct = totalInside > 0 ? (count / totalInside) * 100 : 0;
      return { label, count, pct };
    });
    if (noDataCount > 0) {
      coverageItems.push({
        label: "No data",
        count: noDataCount,
        pct: totalInside > 0 ? (noDataCount / totalInside) * 100 : 0,
      });
    }
    setCoverageStats({
      totalInside,
      totalValid,
      items: coverageItems,
    });

    updateProgress(100);
    setRenderLoading(false);
  };

  return (
    <Spin spinning={loading} tip="Loading NetCDF...">
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
                            setRaster(null);
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
                    setRaster(null);
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

                <div style={{ textAlign: "left", fontSize: 12, marginTop: 10, marginBottom: 6 }}>
                  Date
                </div>
                <Select
                  showSearch
                  placeholder="Select Date"
                  optionFilterProp="label"
                  value={selectedTime}
                  onChange={(value) => setSelectedTime(value)}
                  options={timeOptions}
                  disabled={timeOptions.length === 0}
                />
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

              {selectedTimeLabel ? (
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
                    maxWidth: 260,
                  }}
                >
                  Date: {selectedTimeLabel}
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
                    : `Rendering ${renderProgress}%`}
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
              <NcValueOnClick ncMetaRef={ncMetaRef} selectedTime={selectedTime} />
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
              {raster ? <NcRasterLayer raster={raster} /> : null}
              </MapContainer>

              {raster ? (
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

              {raster && coverageStats && statsOpen ? (
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
