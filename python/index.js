const { spawnSync } = require("child_process");
const express = require("express");
const spawn = require("child_process").spawn;
const cors = require("cors");
var bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Store active Python processes for getdata endpoint only
const activeDataProcesses = new Map();

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
