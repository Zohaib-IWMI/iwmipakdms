<!DOCTYPE html>
<html>
<head>
  <title>Drought Prediction - SPI</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
  <style>
    body { 
      margin:0; 
      padding:0; 
      font-family:Arial, sans-serif; 
      background: #f5f5f5;
    }
    #container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    #header {
      background: linear-gradient(135deg, #fcfcfcff, #0b1622ff, #010508ff);
      padding: 20px;
      border-bottom: 4px solid #e74c3c;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      color: white;
      text-align: center;
    }
    #main {
      display: flex;
      flex: 1;
      height: calc(100vh - 140px);
    }
    #sidebar {
      width: 320px;
      background: white;
      padding: 20px;
      border-right: 2px solid #bdc3c7;
      overflow-y: auto;
    }
    #map-container {
      flex: 1;
      position: relative;
    }
    #map-content {
      width: 100%;
      height: 100%;
    }
    
    /* Controls */
    .control-group {
      margin-bottom: 25px;
      padding: 20px;
      background: #ecf0f1;
      border-radius: 10px;
      border: 2px solid #bdc3c7;
    }
    .control-group h3 {
      margin: 0 0 15px 0;
      color: #2c3e50;
      font-size: 18px;
      border-bottom: 3px solid #e74c3c;
      padding-bottom: 8px;
    }
    label {
      display: block;
      margin: 12px 0 6px 0;
      font-weight: bold;
      color: #2c3e50;
      font-size: 14px;
    }
    select, input, button {
      width: 100%;
      padding: 12px;
      border: 2px solid #bdc3c7;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
      transition: all 0.3s;
    }
    select:focus, input:focus {
      border-color: #3498db;
      outline: none;
    }
    button {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
      border: none;
      cursor: pointer;
      font-weight: bold;
      font-size: 16px;
      margin-top: 10px;
    }
    button:hover {
      background: linear-gradient(135deg, #c0392b, #a93226);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    /* Legend */
    #legend {
      position: absolute;
      bottom: 30px;
      left: 30px;
      background: rgba(255, 255, 255, 0.95);
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      border: 2px solid #bdc3c7;
      min-width: 280px;
      z-index: 1000;
    }
    .legend-header {
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
      color: #2c3e50;
      font-size: 20px;
      border-bottom: 3px solid #e74c3c;
      padding-bottom: 10px;
    }
    .legend-gradient {
      height: 35px;
      width: 100%;
      background: linear-gradient(to right, 
        #8B0000 0%,     /* Dark Red - Extreme Drought */
        #FF0000 16.67%, /* Red - Severe Drought */
        #FF8C00 33.33%, /* Dark Orange - Moderate Drought */
        #FFD700 50%,    /* Gold - Mild Drought */
        #00FF00 66.67%, /* Green - Normal */
        #0000FF 83.33%, /* Blue - Wet */
        #00008B 100%    /* Dark Blue - Very Wet */
      );
      border: 3px solid #2c3e50;
      border-radius: 8px;
      margin: 15px 0;
    }
    .legend-labels {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: bold;
      color: #2c3e50;
      margin-top: 8px;
    }
    .legend-unit {
      text-align: center;
      font-style: italic;
      color: #7f8c8d;
      font-size: 14px;
      margin-top: 8px;
      font-weight: bold;
    }
    
    /* Statistics */
    .stats-panel {
      background: white;
      padding: 20px;
      border-radius: 10px;
      border: 2px solid #bdc3c7;
      margin-top: 20px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #ecf0f1;
    }
    .stat-value {
      /* font-weight: bold; */
      color: #2c3e50;
      font-size: 12px;
    }
    
    /* Time step info */
    .time-info {
      /* background: #f5f4f3ff; */
      padding: 15px;
      border-radius: 8px;
      /* border-left: 5px solid #e74c3c; */
      margin: 15px 0;
      box-shadow: 0 3px 6px rgba(0,0,0,0.1);
    }
    
    /* Drought categories */
    .drought-categories {
      background: #fff;
      padding: 15px;
      border-radius: 8px;
      border: 2px solid #bdc3c7;
      margin-top: 15px;
    }
    .category-item {
      display: flex;
      align-items: center;
      margin: 8px 0;
      padding: 2px;
    }
    .category-color {
      width: 15px;
      height: 15px;
      margin-right: 10px;
      border: 2px solid #333;
      border-radius: 3px;
      font-weight: bold;
    }

    span {
    font-size: 12px;
    }
    
    /* Debug info */
    .debug-info {
      background: #2c3e50;
      color: white;
      padding: 10px;
      border-radius: 5px;
      margin-top: 10px;
      font-size: 12px;
      font-family: monospace;
    }
    
    /* Custom control styles */
    .leaflet-bar button {
      background: white;
      border: none;
      border-bottom: 1px solid #ccc;
      width: 30px;
      height: 30px;
      line-height: 30px;
      display: block;
      text-align: center;
      text-decoration: none;
      color: black;
    }
    .leaflet-bar button:hover {
      background: #f4f4f4;
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="header" 
     style="display: flex; align-items: center; justify-content: center; position: relative; padding: 10px;">

      <!-- Logo (fixed left) -->
      <div style="position: absolute; left: 10px;">
        <img src="images/iwmilogo.png" alt="Logo" 
            style="height:60px; width:auto;">
      </div>

      <!-- Title & Subtitle (centered) -->
      <div style="text-align: center;">
        <h1 style="margin:0; font-size: 32px; 
                  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
          Drought Forecasting - Pakistan
        </h1>
        <p style="margin:8px 0 0 0; font-size: 20px; 
                  font-weight: bold; color: #ecf0f1;">
          Standardized Precipitation Index (SPI) Monitoring
        </p>
      </div>

    </div>

    
    <div id="main">
      <div id="sidebar">
        <div class="control-group">
          <h3>Data Controls</h3>
          <label for="fileInput">Select NetCDF File:</label>
          <input type="file" id="fileInput" accept=".nc,.nc4">
          
          <div id="timeControls" style="display:none;">
            <label for="timeSelect">Time Step:</label>
            <select id="timeSelect"></select>
            
            <div id="timeInfo" class="time-info"></div>
            
            <label for="opacitySlider">Layer Opacity:</label>
            <input type="range" id="opacitySlider" min="0" max="1" step="0.1" value="0.85">
            
            <button id="renderMap">Generate Drought Map</button>
          </div>
        </div>

        <div class="drought-categories">
          <h3 style="margin:0 0 15px 0; color: #2c3e50; text-align:left; border-bottom: 3px solid #e74c3c; padding-bottom: 8px;">SPI Categories</h3>
          <div class="category-item">
            <div class="category-color" style="background: #8B0000;"></div>
            <span>Extreme Drought (SPI ≤ -2.0)</span>
          </div>
          <div class="category-item">
            <div class="category-color" style="background: #FF0000;"></div>
            <span>Severe Drought (-2.0 < SPI ≤ -1.5)</span>
          </div>
          <div class="category-item">
            <div class="category-color" style="background: #FF8C00;"></div>
            <span>Moderate Drought (-1.5 < SPI ≤ -1.0)</span>
          </div>
          <div class="category-item">
            <div class="category-color" style="background: #FFD700;"></div>
            <span>Mild Drought (-1.0 < SPI ≤ -0.5)</span>
          </div>
          <div class="category-item">
            <div class="category-color" style="background: #00FF00;"></div>
            <span>Normal (-0.5 < SPI ≤ 0.5)</span>
          </div>
          <div class="category-item">
            <div class="category-color" style="background: #0000FF;"></div>
            <span>Wet (0.5 < SPI ≤ 1.5)</span>
          </div>
          <div class="category-item">
            <div class="category-color" style="background: #00008B;"></div>
            <span>Very Wet (SPI > 1.5)</span>
          </div>
        </div>
        
        <div class="stats-panel" id="statsPanel" style="display:none;">
          <h3 style="margin:0 0 15px 0; color: #2c3e50; text-align:left; border-bottom: 3px solid #e74c3c; padding-bottom: 8px;">Dataset Statistics</h3>
          <div id="statsContent"></div>
        </div>
        <div id="debugInfo" class="debug-info" style="display:none;">
          <strong>Debug Information:</strong>
          <div id="debugContent"></div>
        </div>
      </div>
      
      
      <div id="map-container">
        <div id="map-content"></div>
        
        <div id="legend" style="display:none;">
          <div class="legend-header">SPI Values</div>
          <div class="legend-gradient"></div>
          <div class="legend-labels">
            <span>-3.0</span>
            <span>-2.0</span>
            <span>-1.0</span>
            <span>0.0</span>
            <span>1.0</span>
            <span>2.0</span>
            <span>3.0</span>
          </div>
          <div class="legend-unit">Standardized Precipitation Index</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <!-- NetCDF.js library version 0.3.1 -->
  <script src="https://unpkg.com/netcdfjs@0.3.1/dist/netcdfjs.min.js"></script>
  <script src="js/netcdfjs.min.js"></script>
<script src="js/app.js"></script>
  <script src="https://unpkg.com/leaflet.mask/leaflet.mask.js"></script>

  <script src="js/leaflet.js"></script>
  
 <script type="text/javascript">

        var map, markers=[], labels=[], markerCluster='', geojsonLayer='', provinces='', filters_counter=2;
        //var allowed_provinces = ['{!! implode("','", json_decode(auth()->user()->roles[0]->additional)->provinces) !!}'];
        var allowed_districts = ['{!! implode("','", json_decode(auth()->user()->roles[0]->additional)->districts) !!}'];
        var pakistan_data = {}, provinces_data = {}, districts_data = {}, cca_data = {}, tehsils_data = {}, layerGroup = '';
        var irrigation_boundaries = [], irrigation_boundaries_layers = [], punjab_irrigation_boundaries_layer='';
        var default_color= '#ff0000', default_weight= 1, default_fill_opacity= 0.0005;
        var mouseover_color= '#ff0000', mouseover_weight= 1, mouseover_fill_opacity= 0.2;
        var mouseout_color= '#ff0000', mouseout_weight= 1, mouseout_fill_opacity= 0.0005;
        var heat_maps_list = [], heat_maps_selected_filters = [];
        var administrative_scroll = '', irrigation_scroll = '';
        var current_active_view = 'administrative'; // irrigation
        var colors_list = { 1: "#000000", 2: "#FFFFFF", 3: "#FFD700", 4: "#ADFF2F", 5: "#7CFC00", 6: "#32CD32", 7: "#00FA9A", 8: "#40E0D0", 9: "#AFEEEE", 10: "#E0FFFF", 11: "#FFFFE0", 12: "#FAFAD2", 13: "#FFE4C4", 14: "#FFDAB9", 15: "#FFEFD5", 16: "#FFFACD", 17: "#FFF5EE", 18: "#F0FFF0", 19: "#F5FFFA", 20: "#F0F8FF", 21: "#FAEBD7", 22: "#F8F8FF", 23: "#D3D3D3", 24: "#C0C0C0", 25: "#E6E6FA", 26: "#FFF0F5", 27: "#FFE4E1", 28: "#F5F5DC", 29: "#FFF8DC", 30: "#FFFFF0" };
        var propertyMapping = { "agro-climate-zones.json": "Zones", "agro-ecological-zones.json": "pk_name", "Barrages.json": "NAME", "Lakes.json": "NAME", "Major Cities.json": "NAME", "Mega Dams.json": "NAME", "Road Network.json": "RD_NAME", "Wetlands.json": "NAME_OF_WE", "Rivers.json": "NAME_EN", "Small Dams.json": "NAME", "Drainage Network.json": "NAME" };
        var propertyColors  = { "agro-climate-zones.json": "#33ff33", "agro-ecological-zones.json": "#ff66ff", "Barrages.json": "#C00000", "Drainage Network.json": "#215F9A", "Lakes.json": "#44eeff", "Major Cities.json": "#DAA600", "Mega Dams.json": "#081DB8", "Mini Dams_Ponds.json": "#9CF2E2", "Rivers.json": "#3B51F7", "Road Network.json": "#C04F15", "Settlements.json": "#FF0000", "Small Dams.json": "#43E3CC", "Stream Network.json": "#61CBF4", "Wetlands.json": "#3B7D23", "Sub Basins_1.json": "#275317", "Sub Basins_2.json": "#275317", "Sub Basins_3.json": "#275317" };
        //var component = @json($component);
  </script>
  <script>
    //let map;
    //let layerGroup;
    //let pakistan_data;
    //let provinces_data = {};
    let allowed_provinces = ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Gilgit-Baltistan'];
    let component = 'spi'; // Default component

    let currentRasterLayer = null;
    let currentFileData = null;
    let dataStatistics = null;

    function initMap() {
        map = L.map('map-content', { preferCanvas: true, loadingControl: true, maxZoom: 18 }).setView([30.7581542, 73.8814889], 5);
        layerGroup = L.layerGroup().addTo(map);

        // Custom control (button with SVG icon) for download
        var customControl = L.Control.extend({ 
            options: { position: 'topleft' },
            onAdd: function (map) {
                var container = L.DomUtil.create('div', 'leaflet-bar');
                var button = L.DomUtil.create('button', '', container);
                button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
                button.title = 'Download';
                L.DomEvent.on(button, 'click', function () {
                    exportMap();
                });
                return container;
            }
        });

        // Add the custom button control to the map
        var customButton = new customControl();
        map.addControl(customButton);

        // Load Pakistan boundary and setup base layers
        fetch('data-files/pakistan.boundary.json').then(response => response.json()).then(data => {
            pakistan_data = data;

            // Add Pakistan boundary mask
           L.mask('data-files/pakistan.boundary.json', {fillOpacity: 0.95, stroke: 0.5}).addTo(map);
            
            // Use ESRI World Imagery as default base layer
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {	
                attribution: '' 
            }).addTo(map);

            // Layer control with multiple base layers
            L.control.layers({
                "Open Street": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }),
                "Carto Dark Matter": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '', maxZoom: 20 }),
                "Open Topo": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '', maxZoom: 17 }),
                "ESRI Nat Geo": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', { attribution: '', maxZoom: 16 }),
                "ESRI World Imagery": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '' }),
                "ESRI World Shaded": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', { attribution: '', maxZoom: 13 }),
                "ESRI World Street": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { attribution: '' }),
                "Top Plus Grey": L.tileLayer('http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png', { attribution: '', maxZoom: 18 }),
                "Top Plus Color": L.tileLayer('http://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png', { attribution: '', maxZoom: 18 }),
            }).addTo(map);

            // Load province boundaries
            (async () => {
                for (let province of allowed_provinces) {
                    try {
                        let temp_province_name = province.toLowerCase().replace(' ', '-');
                        let response = await fetch('data-files/provinces/' + temp_province_name + '.json');
                        let data = await response.json();
                        provinces_data[temp_province_name] = data;
                    } catch (error) {
                        console.error('Error loading the ' + temp_province_name + ' data file:', error);
                    }
                }
            })();

        }).catch(error => console.error('Error loading the pakistan.boundary data file:', error));
    }

    function updateStatus(message, type = 'info') {
      const datasetInfo = document.getElementById('datasetInfo');
      if (!datasetInfo) return;
      
      const color = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db';
      datasetInfo.innerHTML = `<p style="color:${color}; text-align:center; font-weight:bold; padding:10px; background:#ecf0f1; border-radius:5px;">${message}</p>`;
    }

    function showDebugInfo(message) {
      const debugInfo = document.getElementById('debugInfo');
      const debugContent = document.getElementById('debugContent');
      //debugInfo.style.display = 'block';
      debugContent.innerHTML = message;
      console.log('DEBUG:', message);
    }

    // NetCDF file handling
    // NetCDF file handling
    document.getElementById('fileInput').addEventListener('change', async function (e) {
      const file = e.target.files[0];
      if (!file) return;

      updateStatus('📂 Reading NetCDF file...', 'info');
      showDebugInfo(`Starting file processing for <b>${file.name}</b> ...`);

      try {
        debugInfo.style.display = 'hiden';
        // ✅ Ensure NetCDFReader (alias of netcdfjs) is available
        const NetCDFReader = window.NetCDFReader || window.netcdfjs;
        if (typeof NetCDFReader === "undefined") {
          throw new Error("NetCDFReader is not defined. Make sure netcdfjs.min.js is included before this script.");
        }

        // ✅ Parse the NetCDF file
        const netcdfData = await parseNetCDFFile(file, NetCDFReader);
        currentFileData = netcdfData;

        // ✅ Validate required structure
        if (!netcdfData.lats || !netcdfData.lons) {
          throw new Error("Latitude/Longitude data not found in file.");
        }
        if (!netcdfData.timeSteps) {
          throw new Error("Time variable not found in file.");
        }
        if (!netcdfData.spi) {
          showDebugInfo("⚠️ SPI variable not found. Only lat/lon/time loaded.");
        }

        // ✅ Calculate statistics
        dataStatistics = calculateStatistics(netcdfData);

        // ✅ Populate UI controls
        populateTimeSelector(netcdfData.timeSteps, dataStatistics);
        document.getElementById('timeControls').style.display = 'block';
        document.getElementById('statsPanel').style.display = 'block';
        document.getElementById('legend').style.display = 'block';

        // ✅ Show stats
        showStatistics(dataStatistics);

        // ✅ Show metadata / debug info
        const latMin = Math.min(...netcdfData.lats).toFixed(2);
        const latMax = Math.max(...netcdfData.lats).toFixed(2);
        const lonMin = Math.min(...netcdfData.lons).toFixed(2);
        const lonMax = Math.max(...netcdfData.lons).toFixed(2);

        showDebugInfo(`
          File parsed successfully: <b>${file.name}</b><br>
          Latitude range: ${latMin} – ${latMax}<br>
          Longitude range: ${lonMin} – ${lonMax}<br>
          Time steps: ${netcdfData.timeSteps}<br>
          Grid size: ${netcdfData.lats.length} × ${netcdfData.lons.length}
        `);

        updateStatus('✅ NetCDF file loaded successfully!', 'success');

      } catch (err) {
        debugInfo.style.display = 'block';
        console.error('❌ NetCDF parsing error:', err);

        // ✅ Special handling for unsupported formats (NetCDF4/HDF5)
        if (err.message.includes("HDF5") || err.message.includes("NetCDF v3")) {
          showDebugInfo(`
            ❌ Error: This file is likely NetCDF-4 (HDF5-based), which netcdfjs does not support.<br>
            💡 Convert it to NetCDF-3 format with:<br>
            <pre>nccopy -k classic ${file.name} ${file.name.replace('.nc', '_classic.nc')}</pre>
          `);
          updateStatus('⚠️ NetCDF-4 format not supported. Please convert to NetCDF-3.', 'error');
        } else {
          showDebugInfo(`❌ Error: ${err.message}`);
          updateStatus(`Error reading NetCDF file: ${err.message}`, 'error');
        }
      }
    });



    async function parseNetCDFFile(file) {
      return new Promise((resolve, reject) => {
        const netcdfReader = new FileReader();
        
        netcdfReader.onload = function(e) {
          try {
            const arrayBuffer = e.target.result;
            showDebugInfo('File read successfully, parsing NetCDF...');
            
            // Parse NetCDF file using version 0.3.1 API
            //const netcdfReader = new NetCDFReader(arrayBuffer);
            const netcdfReader = new window.netcdfjs(arrayBuffer);
            
            // Log available variables for debugging
            console.log('NetCDF variables:', netcdfReader.variables);
            console.log('NetCDF dimensions:', netcdfReader.dimensions);
            
            showDebugInfo(`Variables found: ${netcdfReader.variables.map(v => v.name).join(', ')}`);
            
            // Extract latitude and longitude data
            let lats, lons, spi, times;
            
            // Find latitude variable (common names: lat, latitude, y)
            const latVar = netcdfReader.variables.find(v => 
              v.name === 'lat' || v.name === 'latitude' || v.name === 'y');
            if (latVar) {
              lats = netcdfReader.getDataVariable(latVar);
            } else {
              throw new Error('Latitude variable not found in NetCDF file');
            }
            
            // Find longitude variable (common names: lon, longitude, x)
            const lonVar = netcdfReader.variables.find(v => 
              v.name === 'lon' || v.name === 'longitude' || v.name === 'x');
            if (lonVar) {
              lons = netcdfReader.getDataVariable(lonVar);
            } else {
              throw new Error('Longitude variable not found in NetCDF file');
            }
            
            // Find SPI data
            const spiVar = netcdfReader.variables.find(v => v.name === 'spi');
            if (spiVar) {
              spi = netcdfReader.getDataVariable(spiVar);
            } else {
              // Try to find any data variable that's not lat/lon/time
              const dataVars = netcdfReader.variables.filter(v => 
                !['lat', 'latitude', 'lon', 'longitude', 'time', 'x', 'y'].includes(v.name));
              if (dataVars.length > 0) {
                spi = netcdfReader.getDataVariable(dataVars[0]);
                showDebugInfo(`Using data variable: ${dataVars[0].name}`);
              } else {
                throw new Error('SPI data variable not found in NetCDF file');
              }
            }
            
            // Find time variable
            const timeVar = netcdfReader.variables.find(v => v.name === 'time');
            if (timeVar) {
              times = netcdfReader.getDataVariable(timeVar);
            }
            
            showDebugInfo(`Latitude: ${lats.length} values (${Math.min(...lats).toFixed(2)} to ${Math.max(...lats).toFixed(2)})<br>
                          Longitude: ${lons.length} values (${Math.min(...lons).toFixed(2)} to ${Math.max(...lons).toFixed(2)})<br>
                          SPI data points: ${spi.length}`);
            
            // Determine data dimensions and reshape SPI data
            const timeDim = netcdfReader.dimensions.find(d => d.name === 'time');
            const latDim = netcdfReader.dimensions.find(d => d.name === 'lat' || d.name === 'y');
            const lonDim = netcdfReader.dimensions.find(d => d.name === 'lon' || d.name === 'x');
            
            const timeSize = timeDim ? timeDim.size : 1;
            const latSize = latDim ? latDim.size : lats.length;
            const lonSize = lonDim ? lonDim.size : lons.length;
            
            showDebugInfo(`Dimensions: time=${timeSize}, lat=${latSize}, lon=${lonSize}`);
            
            // Reshape SPI data into 3D array [time][lat][lon]
            const spiData = [];
            if (timeSize > 1) {
              for (let t = 0; t < timeSize; t++) {
                const timeSlice = [];
                for (let i = 0; i < latSize; i++) {
                  const row = [];
                  for (let j = 0; j < lonSize; j++) {
                    const idx = t * latSize * lonSize + i * lonSize + j;
                    if (idx < spi.length) {
                      row.push(spi[idx]);
                    } else {
                      row.push(NaN);
                    }
                  }
                  timeSlice.push(row);
                }
                spiData.push(timeSlice);
              }
            } else {
              // Single time step
              const timeSlice = [];
              for (let i = 0; i < latSize; i++) {
                const row = [];
                for (let j = 0; j < lonSize; j++) {
                  const idx = i * lonSize + j;
                  if (idx < spi.length) {
                    row.push(spi[idx]);
                  } else {
                    row.push(NaN);
                  }
                }
                timeSlice.push(row);
              }
              spiData.push(timeSlice);
            }
            
            
          const dates = [];
          if (times && times.length > 0 && timeVar && timeVar.attributes) {
            // Example: "days since 2025-04-23 00:00"
            const unitsAttr = timeVar.attributes.find(a => a.name === "units");
            let baseDate = new Date(1900, 0, 1); // fallback

            if (unitsAttr && unitsAttr.value) {
              const match = unitsAttr.value.match(/since\s+(.+)/);
              if (match) {
                // Convert "2025-04-23 00:00" into valid ISO date string
                baseDate = new Date(match[1].replace(" ", "T") + "Z");
              }
            }

            // Loop through *all* available time values
            for (let i = 0; i < times.length; i++) {
              const date = new Date(baseDate);
              date.setUTCDate(baseDate.getUTCDate() + times[i]);
              dates.push(date.toISOString().slice(0, 16).replace("T", " ")); // "YYYY-MM-DD HH:mm"
            }
          } else {
            for (let i = 0; i < timeSize; i++) {
              dates.push(`Time Step ${i + 1}`);
            }
          }

          // Debug print
          console.log("Extracted dates:", dates);
          showDebugInfo(`Extracted ${dates.length} dates:<br>${dates.join("<br>")}`);



            
            const result = {
              lats: lats,
              lons: lons,
              spiData: spiData,
              timeSteps: timeSize,
              dates: dates,
              bounds: [
                [Math.min(...lats), Math.min(...lons)],
                [Math.max(...lats), Math.max(...lons)]
              ]
            };
            
            showDebugInfo(`Final bounds: ${result.bounds[0][0].toFixed(2)}-${result.bounds[1][0].toFixed(2)}°N, 
                          ${result.bounds[0][1].toFixed(2)}-${result.bounds[1][1].toFixed(2)}°E`);
            
            resolve(result);
            
          } catch (error) {
            reject(error);
          }
        };
        
        netcdfReader.onerror = function() {
          reject(new Error('Failed to read file'));
        };
        
        netcdfReader.readAsArrayBuffer(file);
      });
    }

    document.getElementById('renderMap').addEventListener('click', function() {
      if (!currentFileData) return;
      
      const timeIndex = parseInt(document.getElementById('timeSelect').value);
      const opacity = parseFloat(document.getElementById('opacitySlider').value);
      
      renderRasterMap(currentFileData, timeIndex, opacity);
    });

    function populateTimeSelector(timeSteps, stats) {
      const select = document.getElementById('timeSelect');
      select.innerHTML = '';
      
      for (let i = 0; i < timeSteps; i++) {
        const option = document.createElement('option');
        option.value = i;
        const dateStr = stats.timeStepStats[i].date;
        const validPoints = stats.timeStepStats[i].validPoints;
        option.textContent = `${dateStr} (${validPoints.toLocaleString()} points)`;
        option.title = `SPI Range: ${stats.timeStepStats[i].minValue.toFixed(1)} to ${stats.timeStepStats[i].maxValue.toFixed(1)}`;
        select.appendChild(option);
      }
      
      // Update time step info when selection changes
       select.addEventListener('change', function() {
       updateTimeStepInfo(parseInt(this.value), stats);
      });
      
      // Show info for first time step
      updateTimeStepInfo(0, stats);
    }

    function updateTimeStepInfo(timeIndex, stats) {
      const infoDiv = document.getElementById('timeInfo');
      const stepStats = stats.timeStepStats[timeIndex];
      
      // Calculate drought severity percentages
      const droughtLevels = calculateDroughtLevels(currentFileData, timeIndex);
      
      infoDiv.innerHTML = `
        <div style="font-size: 14px; line-height: 1.4;">
          <strong>Date:</strong> ${stepStats.date}<br>
          <strong>Valid Points:</strong> ${stepStats.validPoints.toLocaleString()}<br>
          <strong>SPI Range:</strong> ${stepStats.minValue.toFixed(1)} to ${stepStats.maxValue.toFixed(1)}<br><br>
          <strong>Drought Areas:</strong><br>
          <span style="color:#8B0000;">● Extreme: ${droughtLevels.extreme}%</span><br>
          <span style="color:#FF0000;">● Severe: ${droughtLevels.severe}%</span><br>
          <span style="color:#FF8C00;">● Moderate: ${droughtLevels.moderate}%</span>
        </div>
      `;
    }

    function calculateDroughtLevels(data, timeIndex) {
      const spiGrid = data.spiData[timeIndex];
      let extreme = 0, severe = 0, moderate = 0, mild = 0, normal = 0, wet = 0, veryWet = 0;
      let totalValid = 0;
      
      for (let i = 0; i < data.lats.length; i++) {
        for (let j = 0; j < data.lons.length; j++) {
          const value = spiGrid[i][j];
          if (!isNaN(value) && isFinite(value)) {
            totalValid++;
            if (value <= -2.0) extreme++;
            else if (value <= -1.5) severe++;
            else if (value <= -1.0) moderate++;
            else if (value <= -0.5) mild++;
            else if (value <= 0.5) normal++;
            else if (value <= 1.5) wet++;
            else veryWet++;
          }
        }
      }
      
      return {
        extreme: totalValid > 0 ? ((extreme / totalValid) * 100).toFixed(1) : '0.0',
        severe: totalValid > 0 ? ((severe / totalValid) * 100).toFixed(1) : '0.0',
        moderate: totalValid > 0 ? ((moderate / totalValid) * 100).toFixed(1) : '0.0',
        mild: totalValid > 0 ? ((mild / totalValid) * 100).toFixed(1) : '0.0',
        normal: totalValid > 0 ? ((normal / totalValid) * 100).toFixed(1) : '0.0',
        wet: totalValid > 0 ? ((wet / totalValid) * 100).toFixed(1) : '0.0',
        veryWet: totalValid > 0 ? ((veryWet / totalValid) * 100).toFixed(1) : '0.0'
      };
    }

    function calculateStatistics(data) {
      const stats = {
        totalTimeSteps: data.timeSteps,
        gridDimensions: {
          lats: data.lats.length,
          lons: data.lons.length,
          totalPoints: data.lats.length * data.lons.length
        },
        timeStepStats: [],
        overallStats: {
          minSPI: 3.0,
          maxSPI: -3.0,
          totalValidPoints: 0
        }
      };
      
      for (let t = 0; t < data.timeSteps; t++) {
        let validPoints = 0;
        let minValue = 3.0;
        let maxValue = -3.0;
        
        for (let i = 0; i < data.lats.length; i++) {
          for (let j = 0; j < data.lons.length; j++) {
            const value = data.spiData[t][i][j];
            if (!isNaN(value) && isFinite(value)) {
              validPoints++;
              minValue = Math.min(minValue, value);
              maxValue = Math.max(maxValue, value);
            }
          }
        }
        
        const timeStepStat = {
          date: data.dates[t],
          totalPoints: data.lats.length * data.lons.length,
          validPoints: validPoints,
          minValue: minValue !== 3.0 ? minValue : NaN,
          maxValue: maxValue !== -3.0 ? maxValue : NaN
        };
        
        stats.timeStepStats.push(timeStepStat);
        stats.overallStats.minSPI = Math.min(stats.overallStats.minSPI, minValue);
        stats.overallStats.maxSPI = Math.max(stats.overallStats.maxSPI, maxValue);
        stats.overallStats.totalValidPoints += validPoints;
      }
      
      return stats;
    }

    function showStatistics(stats) {
      const statsContent = document.getElementById('statsContent');
      
      statsContent.innerHTML = `
        <div class="stat-item">
          <span>Time Steps:</span>
          <span class="stat-value">${stats.totalTimeSteps}</span>
        </div>
        <div class="stat-item">
          <span>Grid Resolution:</span>
          <span class="stat-value">${stats.gridDimensions.lats} × ${stats.gridDimensions.lons}</span>
        </div>
        <div class="stat-item">
          <span>Points per Step:</span>
          <span class="stat-value">${stats.gridDimensions.totalPoints.toLocaleString()}</span>
        </div>
        <div class="stat-item">
          <span>SPI Range:</span>
          <span class="stat-value">${stats.overallStats.minSPI.toFixed(1)} to ${stats.overallStats.maxSPI.toFixed(1)}</span>
        </div>
        <div class="stat-item">
          <span>Total Data Points:</span>
          <span class="stat-value">${stats.overallStats.totalValidPoints.toLocaleString()}</span>
        </div>
      `;
    }

    function renderRasterMap(data, timeIndex, opacity) {
      updateStatus('Generating drought prediction map...', 'info');
      
      // Clear previous raster layer
      if (currentRasterLayer) {
        map.removeLayer(currentRasterLayer);
      }
      
      // Get the data for selected time
      const spiGrid = data.spiData[timeIndex];
      const currentStats = dataStatistics.timeStepStats[timeIndex];
      
      // Create raster layer using rectangles
      const rasterLayer = L.layerGroup();
      
      const latStep = data.lats[1] - data.lats[0];
      const lonStep = data.lons[1] - data.lons[0];
      
      for (let i = 0; i < data.lats.length - 1; i++) {
        for (let j = 0; j < data.lons.length - 1; j++) {
          const spiValue = spiGrid[i][j];
          if (!isNaN(spiValue) && isFinite(spiValue)) {
            const bounds = [
              [data.lats[i], data.lons[j]],
              [data.lats[i + 1], data.lons[j + 1]]
            ];
            
            L.rectangle(bounds, {
              color: getColorForSPI(spiValue),
              fillColor: getColorForSPI(spiValue),
              fillOpacity: opacity,
              weight: 0, // No border for smooth appearance
              interactive: true
            }).addTo(rasterLayer)
              .bindPopup(`
                <div style="text-align:center; min-width:180px; padding:10px;">
                  <h4 style="margin:0 0 10px 0; color: #e74c3c;">Drought Assessment</h4>
                  <strong>SPI Value:</strong> ${spiValue.toFixed(2)}<br>
                  <strong>Category:</strong> ${getSPICategory(spiValue)}<br>
                  <strong>Location:</strong><br>
                  Lat: ${data.lats[i].toFixed(2)}°N<br>
                  Lon: ${data.lons[j].toFixed(2)}°E<br>
                  <strong>Date:</strong> ${currentStats.date}
                </div>
              `);
          }
        }
      }
      
      currentRasterLayer = rasterLayer;
      currentRasterLayer.addTo(map);
      
      // Fit bounds to ACTUAL data from your NetCDF file, but stay within Pakistan bounds
      if (data.bounds) {
        map.fitBounds(data.bounds);
      }
      
      updateStatus(`Drought map generated for ${currentStats.date}`, 'success');
      showDebugInfo(`Map bounds set to: ${data.bounds[0][0].toFixed(2)}-${data.bounds[1][0].toFixed(2)}°N, ${data.bounds[0][1].toFixed(2)}-${data.bounds[1][1].toFixed(2)}°E`);
    }

    function getColorForSPI(spiValue) {
      // Dark red to dark blue gradient for drought prediction
      if (spiValue <= -2.5) return '#8B0000'; // Extreme drought - Dark Red
      if (spiValue <= -2.0) return '#8B0000'; // Extreme drought
      if (spiValue <= -1.5) return '#FF0000'; // Severe drought - Red
      if (spiValue <= -1.0) return '#FF8C00'; // Moderate drought - Dark Orange
      if (spiValue <= -0.5) return '#FFD700'; // Mild drought - Gold
      if (spiValue <= 0.5) return '#00FF00';  // Normal - Green
      if (spiValue <= 1.0) return '#00BFFF';  // Wet - Light Blue
      if (spiValue <= 1.5) return '#0000FF';  // Wet - Blue
      if (spiValue <= 2.0) return '#0000CD';  // Very wet - Medium Blue
      return '#00008B'; // Very wet - Dark Blue
    }

    function getSPICategory(spiValue) {
      if (spiValue <= -2.0) return 'Extreme Drought';
      if (spiValue <= -1.5) return 'Severe Drought';
      if (spiValue <= -1.0) return 'Moderate Drought';
      if (spiValue <= -0.5) return 'Mild Drought';
      if (spiValue <= 0.5) return 'Normal';
      if (spiValue <= 1.5) return 'Wet';
      return 'Very Wet';
    }

    // Opacity control
    document.getElementById('opacitySlider').addEventListener('input', function(e) {
      const opacity = parseFloat(e.target.value);
      if (currentRasterLayer) {
        currentRasterLayer.eachLayer(function(layer) {
          layer.setStyle({
            fillOpacity: opacity
          });
        });
      }
    });

    // Export map function
    function exportMap() {
      // Simple implementation - you can enhance this with better screenshot functionality
      window.open(map.getContainer().toDataURL('image/png'));
    }

    // Add keyboard controls for time navigation
    document.addEventListener('keydown', function(e) {
      if (!currentFileData) return;
      
      const timeSelect = document.getElementById('timeSelect');
      let currentIndex = parseInt(timeSelect.value);
      
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        timeSelect.value = currentIndex - 1;
        timeSelect.dispatchEvent(new Event('change'));
        renderRasterMap(currentFileData, currentIndex - 1, parseFloat(document.getElementById('opacitySlider').value));
      } else if (e.key === 'ArrowRight' && currentIndex < currentFileData.timeSteps - 1) {
        timeSelect.value = currentIndex + 1;
        timeSelect.dispatchEvent(new Event('change'));
        renderRasterMap(currentFileData, currentIndex + 1, parseFloat(document.getElementById('opacitySlider').value));
      }
    });

    // Initialize the map when the page loads
    document.addEventListener('DOMContentLoaded', function() {
      initMap();
      updateStatus('Select a NetCDF file to begin drought monitoring', 'info');
    });
  </script>
</body>
</html>