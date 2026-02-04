const { spawnSync } = require("child_process");
const express = require("express");
const spawn = require("child_process").spawn;
const cors = require("cors");
var bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json({ limit: "25mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Store active Python processes for getdata endpoint only
const activeDataProcesses = new Map();

// Forecast render jobs (NetCDF -> GeoTIFF -> GeoServer)
const activeForecastJobs = new Map();

function buildAssetUrl({ assetUrl, assetPath }) {
  if (assetUrl && typeof assetUrl === "string" && /^https?:\/\//i.test(assetUrl)) {
    return assetUrl;
  }
  const base = process.env.FRONTEND_INTERNAL_URL || "http://frontend";
  if (assetPath && typeof assetPath === "string") {
    if (assetPath.startsWith("http")) return assetPath;
    if (assetPath.startsWith("/")) return `${base}${assetPath}`;
    return `${base}/${assetPath}`;
  }
  return null;
}

function normalizeInternalUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== "string") return null;

  const frontendBase = (process.env.FRONTEND_INTERNAL_URL || "http://frontend").replace(/\/+$/, "");
  const geoserverBase = (process.env.GEOSERVER_INTERNAL_URL || "http://geoserver:8080/geoserver").replace(/\/+$/, "");

  try {
    // Allow relative inputs like /geoserver/ows?... or /static/...geojson
    const u = new URL(inputUrl, "http://placeholder.local");
    const pathname = u.pathname || "/";
    const search = u.search || "";

    // If this is the nginx-proxied geoserver path, rewrite to the internal GeoServer base.
    if (pathname.startsWith("/geoserver/")) {
      const rewrittenPath = pathname.replace(/^\/geoserver/, "");
      return `${geoserverBase}${rewrittenPath}${search}`;
    }

    // If it's already a direct GeoServer OWS/REST path (rare), still bind to internal base.
    if (pathname.startsWith("/ows") || pathname.startsWith("/rest") || pathname.startsWith("/wms") || pathname.startsWith("/wfs")) {
      return `${geoserverBase}${pathname}${search}`;
    }

    // Otherwise treat it as a frontend-hosted URL (e.g., static pakistan.geojson)
    return `${frontendBase}${pathname}${search}`;
  } catch (_) {
    return null;
  }
}

async function deleteGeoServerCoverageStore({ workspace, storeName }) {
  if (!storeName) return;
  const ws = workspace || process.env.GEOSERVER_WORKSPACE || "PakDMS";
  const base = (process.env.GEOSERVER_INTERNAL_URL || "http://geoserver:8080/geoserver").replace(/\/+$/, "");
  const url = new URL(
    `${base}/rest/workspaces/${encodeURIComponent(ws)}/coveragestores/${encodeURIComponent(
      storeName
    )}?recurse=true&purge=all`
  );

  const user = process.env.GEOSERVER_ADMIN_USER || "admin";
  const pass = process.env.GEOSERVER_ADMIN_PASSWORD || "geoserver";
  const auth = Buffer.from(`${user}:${pass}`).toString("base64");

  const http = require(url.protocol === "https:" ? "https" : "http");
  await new Promise((resolve, reject) => {
    const req = http.request(
      {
        method: "DELETE",
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: { Authorization: `Basic ${auth}` },
      },
      (resp) => {
        let body = "";
        resp.on("data", (chunk) => (body += chunk.toString()));
        resp.on("end", () => {
          // 200/202/404 are acceptable (already gone)
          if (![200, 202, 404].includes(resp.statusCode)) {
            return reject(
              new Error(
                `GeoServer delete failed: ${resp.statusCode} ${String(body || "").slice(0, 300)}`
              )
            );
          }
          resolve();
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

app.post("/getboundary", (req, res) => {
  const args = ["--unit", req.body.params.unit];
  console.log('/getboundary called', { unit: req.body.params.unit });

  const pythonProcess = spawn("python", ["jrc_basemap.py", ...args]);

  var d = "";
  var e = "";

  pythonProcess.stdout.on("data", (data) => {
    d += data;
  });

  pythonProcess.stderr.on("data", (data) => {
    e += data;
  });

  pythonProcess.on("close", (code) => {
    console.log(`/getboundary python process closed code=${code} stdout_len=${d.length} stderr_len=${e.length}`);
    // Filter out survey-related errors from Google Earth Engine
    let filteredError = e;
    if (e) {
      const surveyKeywords = ['survey', 'feedback', 'satisfaction', 'qualtrics'];
      const containsSurvey = surveyKeywords.some(keyword =>
        e.toLowerCase().includes(keyword.toLowerCase())
      );

      if (containsSurvey) {
        filteredError = null; // Ignore survey-related errors
      }
    }

    // If we have data, ignore any errors (including survey messages)
    if (d && d.trim() !== "") {
      res.json({ data: d });
    } else if (filteredError) {
      res.json({ data: d, error: filteredError });
    } else {
      res.json({ data: d });
    }
  });
});

app.post("/getlulc", (req, res) => {
  const args = ["--unit", req.body.params.unit];
  console.log('/getlulc called', { unit: req.body.params.unit });

  const pythonProcess = spawn("python", ["sentinellulc.py", ...args]);

  var d = "";
  var e = "";

  pythonProcess.stdout.on("data", (data) => {
    d += data;
  });

  pythonProcess.stderr.on("data", (data) => {
    e += data;
  });

  pythonProcess.on("close", (code) => {
    console.log(`/getlulc python process closed code=${code} stdout_len=${d.length} stderr_len=${e.length}`);
    // Filter out survey-related errors from Google Earth Engine
    let filteredError = e;
    if (e) {
      const surveyKeywords = ['survey', 'feedback', 'satisfaction', 'qualtrics'];
      const containsSurvey = surveyKeywords.some(keyword =>
        e.toLowerCase().includes(keyword.toLowerCase())
      );

      if (containsSurvey) {
        filteredError = null; // Ignore survey-related errors
      }
    }

    // If we have data, ignore any errors (including survey messages)
    if (d && d.trim() !== "") {
      res.json({ data: d });
    } else if (filteredError) {
      res.json({ data: d, error: filteredError });
    } else {
      res.json({ data: d });
    }
  });
});

app.post("/getdata", (req, res) => {
  const args = [
    "--startmonth",
    req.body.params.startmonth,
    "--endmonth",
    req.body.params.endmonth,
    "--startyear",
    req.body.params.startyear,
    "--endyear",
    req.body.params.endyear,
    "--unit",
    req.body.params.unit,
    "--name",
    req.body.params.name,
    "--aggr",
    req.body.params.aggr,
    "--indice",
    req.body.params.indice,
    "--calctype",
    req.body.params.calctype,
    "--precipitation",
    req.body.params.precipitation,
    "--months",
    req.body.params.months,
    "--drawnfeature",
    req.body.params.drawnFeature,
    "--boundaryselect",
    req.body.params.boundarySelect,
    "--filename",
    req.body.params.fileName,
    "--graphoption",
    req.body.params.graphoption,
    "--max",
    req.body.params.max,
    "--min",
    req.body.params.min,
  ];

  const pythonProcess = spawn("python", ["main.py", ...args]);

  // Store the process with a unique ID
  const requestId = Date.now().toString();
  activeDataProcesses.set(requestId, pythonProcess);
  console.log('/getdata called', { requestId, unit: req.body.params.unit, startyear: req.body.params.startyear, endyear: req.body.params.endyear });

  // Set the request ID in the response header
  res.set("Request-ID", requestId);

  var d = "";
  var e = "";

  pythonProcess.stdout.on("data", (data) => {
    d += data;
  });

  pythonProcess.stderr.on("data", (data) => {
    e += data;
  });

  pythonProcess.on("close", (code) => {
    console.log(`/getdata python process closed requestId=${requestId} code=${code} stdout_len=${d.length} stderr_len=${e.length}`);
    // Remove process from active processes when done
    activeDataProcesses.delete(requestId);

    // Filter out survey-related errors from Google Earth Engine
    let filteredError = e;
    if (e) {
      // Check if error contains survey-related content
      const surveyKeywords = ['survey', 'feedback', 'satisfaction', 'qualtrics'];
      const containsSurvey = surveyKeywords.some(keyword =>
        e.toLowerCase().includes(keyword.toLowerCase())
      );

      if (containsSurvey) {
        filteredError = null; // Ignore survey-related errors
      }
    }

    // If we have data, ignore any errors (including survey messages)
    if (d && d.trim() !== "") {
      res.json({ data: d });
    } else if (filteredError) {
      res.json({ data: d, error: filteredError });
    } else {
      res.json({ data: d });
    }
  });

  // IMPORTANT CHANGE: Don't set up the 'close' event handler
  // The client isn't disconnecting - the request is ongoing until the Python process completes
  // Remove this block entirely:
  /*
  req.on('close', () => {
    if (activeDataProcesses.has(requestId)) {
      try {
        const process = activeDataProcesses.get(requestId);
        process.kill();
        activeDataProcesses.delete(requestId);

      } catch (error) {

      }
    }
  });
  */
});

// Start a server-side render job:
// - Downloads the NetCDF from the frontend static asset URL
// - Converts it to a clipped GeoTIFF
// - Publishes as a GeoServer coverage layer
app.post("/forecast/apply", async (req, res) => {
  const params = req.body?.params || req.body || {};
  const assetUrl = buildAssetUrl({ assetUrl: params.assetUrl, assetPath: params.assetPath });

  if (!assetUrl) {
    return res.status(400).json({ success: false, message: "assetUrl/assetPath is required" });
  }

  const clipGeojson = params.clipGeojson ? JSON.stringify(params.clipGeojson) : null;
  const clipUrlRaw = params.clipUrl;
  const clipUrl = clipUrlRaw ? normalizeInternalUrl(String(clipUrlRaw)) : null;
  const timeIndex = Number.isFinite(Number(params.timeIndex)) ? String(Number(params.timeIndex)) : "0";
  const indexKey = params.indexKey ? String(params.indexKey).toUpperCase() : "SPI";
  const workspace = params.workspace || process.env.GEOSERVER_WORKSPACE || "PakDMS";

  const storeName = `forecast_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
  const previousStoreName = params.previousStoreName;

  try {
    if (previousStoreName) {
      await deleteGeoServerCoverageStore({ workspace, storeName: previousStoreName });
    }
  } catch (e) {
    // Non-fatal; continue job creation.
    console.warn("[forecast] cleanup failed", e?.message || e);
  }

  const args = [
    "--assetUrl",
    assetUrl,
    "--timeIndex",
    timeIndex,
    "--indexKey",
    indexKey,
    "--workspace",
    workspace,
    "--storeName",
    storeName,
  ];
  if (clipGeojson) {
    args.push("--clipGeojson", clipGeojson);
  } else if (clipUrl) {
    args.push("--clipUrl", String(clipUrl));
  }

  const jobId = storeName;
  const pythonProcess = spawn("python", ["forecast_render.py", ...args], {
    cwd: __dirname,
  });

  activeForecastJobs.set(jobId, {
    status: "running",
    progress: 0,
    message: "Starting",
    result: null,
    error: null,
    process: pythonProcess,
    startedAt: Date.now(),
  });

  console.log("/forecast/apply called", { jobId, assetUrlLen: assetUrl.length, timeIndex, workspace, clipUrl: clipUrl ? "(normalized)" : null });

  let stdoutBuf = "";
  let stderrBuf = "";

  pythonProcess.stdout.on("data", (data) => {
    stdoutBuf += data.toString();
    const lines = stdoutBuf.split(/\r?\n/);
    stdoutBuf = lines.pop() || "";
    for (const line of lines) {
      if (!line) continue;
      const job = activeForecastJobs.get(jobId);
      if (!job) continue;

      if (line.startsWith("PROGRESS:")) {
        const parts = line.split(":");
        const pct = Number(parts[1] || 0);
        const msg = parts.slice(2).join(":") || "Working";
        job.progress = Number.isFinite(pct) ? pct : job.progress;
        job.message = msg;
      } else if (line.startsWith("RESULT:")) {
        const jsonText = line.slice("RESULT:".length);
        try {
          job.result = JSON.parse(jsonText);
          job.progress = 100;
          job.status = "done";
          job.message = "Done";
        } catch (e) {
          job.status = "error";
          job.error = `Failed to parse RESULT: ${e?.message || e}`;
        }
      } else if (line.startsWith("ERROR:")) {
        job.status = "error";
        job.error = line.slice("ERROR:".length);
      }
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    stderrBuf += data.toString();
  });

  pythonProcess.on("close", (code) => {
    const job = activeForecastJobs.get(jobId);
    if (!job) return;
    if (job.status === "done") return;

    if (code === 0) {
      // If script exited 0 but didn't print RESULT, treat as error.
      job.status = "error";
      job.error = job.error || "Render completed without result";
    } else {
      job.status = "error";
      job.error = job.error || `Python exited with code ${code}`;
    }
    if (stderrBuf && !job.errorDetails) {
      job.errorDetails = stderrBuf.slice(0, 2000);
    }
    console.log(`/forecast/apply job closed jobId=${jobId} code=${code}`);
  });

  // Respond immediately; frontend polls job status
  res.json({ success: true, jobId, storeName, workspace });
});

app.get("/forecast/jobs/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = activeForecastJobs.get(jobId);
  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  res.json({
    success: true,
    jobId,
    status: job.status,
    progress: job.progress,
    message: job.message,
    result: job.result,
    error: job.error,
    errorDetails: job.errorDetails,
    startedAt: job.startedAt,
  });
});

app.post("/forecast/cancel", (req, res) => {
  const params = req.body?.params || req.body || {};
  const jobId = params.jobId;
  const job = jobId ? activeForecastJobs.get(jobId) : null;
  if (!job || !job.process) {
    return res.json({ success: false, message: "Job not found" });
  }
  try {
    job.process.kill();
    job.status = "error";
    job.error = "Cancelled";
    return res.json({ success: true });
  } catch (e) {
    return res.json({ success: false, message: e?.message || String(e) });
  }
});

app.post("/forecast/cleanup", async (req, res) => {
  const params = req.body?.params || req.body || {};
  const storeName = params.storeName;
  const workspace = params.workspace || process.env.GEOSERVER_WORKSPACE || "PakDMS";
  if (!storeName) {
    return res.status(400).json({ success: false, message: "storeName is required" });
  }
  try {
    await deleteGeoServerCoverageStore({ workspace, storeName });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e?.message || String(e) });
  }
});

// Add an endpoint to explicitly cancel a data request
app.post("/cancelDataRequest", (req, res) => {
  const { requestId } = req.body;

  if (requestId && activeDataProcesses.has(requestId)) {
    try {
      const process = activeDataProcesses.get(requestId);
      process.kill();
      activeDataProcesses.delete(requestId);
      res.json({
        success: true,
        message: `Process ${requestId} was terminated`,
      });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  } else {
    res.json({ success: false, message: "No such process found" });
  }
});

const PORT = process.env.PYTHON_DOCKER_PORT || 8082;
app.listen(PORT, () => {
  console.log(`Python backend listening on port ${PORT}`);
});
