import L from "leaflet";
import {
  LayerGroup,
  LayersControl,
  MapContainer,
  ScaleControl,
  TileLayer,
} from "react-leaflet";
import {
  Button,
  Collapse,
  DatePicker,
  Drawer,
  Flex,
  InputNumber,
  Layout,
  Modal,
  Radio,
  Select,
  Slider,
  Space,
  Spin,
  Switch,
  notification,
  Input,
  Checkbox,
} from "antd";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import dayjs from "dayjs";
import { Content, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import "leaflet-loading";
import Control from "react-leaflet-custom-control";
import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

import VectorData from "../../utils/VectorData.js";
import EarthEngine from "../../utils/EarthEngine.js";
import Graph from "../../utils/Graph.js";
import JRCLayer from "../../utils/JRCLayer.js";
import {
  setLoggedIn,
  setSelected,
  setSelectedTwo,
  setselectedKey,
  setSelectedWapor,
  setmodule,
  setshowTour,
} from "../../slices/mapView.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faAnglesRight,
  faCalculator,
  faCalendar,
  faChartLine,
  faCircleMinus,
  faCirclePlus,
  faCodeCompare,
  faGrip,
  faLayerGroup,
  faListCheck,
  faListOl,
  faObjectGroup,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import AddMask from "../../utils/AddMask.js";
import { useCallback } from "react";
import UploadShapefile from "../../utils/UploadShapefile.js";
import WebsiteTour from "../../utils/WebsiteTour.js";

import "leaflet/dist/leaflet.css";
import "leaflet-loading/src/Control.Loading.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "../../style/map.css";
import "../../style/custom.css";
import "../../style/sidebar.css";
import Indices from "../LayerPanels/Indices.js";
import DrawTools from "../DrawTools/DrawTools.js";
import SentinelLULC from "../../utils/SentinelLULC.js";
import LULCLegend from "../../utils/LULCLegend.js";
import HeaderMap from "../../components/HeaderMap.js";
import NorthArrow from "../../utils/NorthArrow.js";
import SwipeModeLayer from "../../utils/SwipeModeLayer.js";
import { logoImages } from "../../helpers/logoImages.js";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

let minDate = dayjs("2001-01-01");

const indicesNames = [
  { CWD: "Climate Water Deficit" },
  { MAI: "Moisture Adequacy Index" },
  { NDVI_Anamoly: "Normalize Difference Vegetation Index" },
  { SMCI: "Soil Moisture Condition Index" },
  { SMCI_FLDAS: "Soil Moisture Condition Index (FLDAS)" },
  { SMCI_SMAP: "Soil Moisture Condition Index (SMAP)" },
  { TCI: "Temperature Condition Index" },
  { VCI: "Vegetation Condition Index" },
  { SMA_WAPOR: "Soil Moisture Anomalies (WaPOR)" },
  { DrySpell: "Dry Spell" },
  { PCI: "Precipitation Condition Index" },
  { SPI_CHIRPS: "Standardized Precipitation Index (CHIRPS)" },
  { SPI_ERA5L: "Standardized Precipitation Index (ERA5L)" },
  { RDI_WAPOR: "Reconnaissance Drought Index (WaPOR)" },
  { ESI_WAPOR: "Evaporative Stress Index (WaPOR)" },
  { NPP_Anamoly_WAPOR: "Net Primary Productivity (WaPOR)" },
  { VHI: "Vegetation Health Index" },
];

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

function MapWrapper(props) {
  const { Panel } = Collapse;
  const mapRef = useRef(null);
  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);
  const ref7 = useRef(null);

  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title, msg, placement) => {
    api[type]({
      message: title,
      description: msg,
      placement,
    });
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    fileName,
    darkmode,
    selected,
    selectedTwo,
    selectedWapor,
    showTour,
    center,
    zoom,
    module,
    admin1,
    admin1Name,
    admin2,
    admin2Name,
  } = useSelector((state) => state);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    title: "Map Export",
    includeTimestamp: true,
    includeLegend: false,
    orientation: "landscape",
    paperSize: "a4",
    quality: "high",
  });
  const [progress, setProgress] = useState(0);
  const [cancelRequestFunction, setCancelRequestFunction] = useState(null);
  const [comparisonOn, setComparisonOn] = useState(false);
  const [layerURL, setLayerURL] = useState([]);
  const [graphModal, setGraphModal] = useState(false);
  const [graphOption, setGraphOption] = useState("bae");
  const [opac, setOpac] = useState(1);
  const [showOpacity, setshowOpacity] = useState(false);
  const [modalIndice, setmodalIndice] = useState("");
  const [modalMessage, setmodalMessage] = useState("");
  const [modalopen, setmodalopen] = useState(false);
  const [color, setcolor] = useState("#000");
  const [open, setOpen] = useState(false);
  const [refresh, setrefresh] = useState(false);
  const [reset, setreset] = useState(false);
  const [applyBtn, setapplyBtn] = useState(true);
  const [graphBtn, setgraphBtn] = useState(false);
  const [showGraph, setshowGraph] = useState(false);
  const [loadlayer, setloadlayer] = useState(false);
  const [legend, setlegend] = useState(false);
  const [legendLULC, setlegendLULC] = useState(false);
  const [showprecipitation, setshowprecipitation] = useState(false);
  const [showmonths, setshowmonths] = useState(false);
  const [months, setmonths] = useState(3);
  const [precipitation, setprecipitation] = useState(2.5);
  const [layermin, setlayermin] = useState(null);
  const [layermax, setlayermax] = useState(null);
  const [calctype, setcalctype] = useState(null);
  const [layerPalette, setlayerPalette] = useState(null);
  const [layerTwoPalette, setlayerTwoPalette] = useState(null);
  // Legend metadata from backend (for discrete legends)
  const [layerLegend, setLayerLegend] = useState(null);
  const [layerLegendTwo, setLayerLegendTwo] = useState(null);
  const [tehsils, setTehsils] = useState([]);
  const [tehsilsLoading, setTehsilsLoading] = useState(false);
  const [calcval, setcalcval] = useState("mean");
  const [startmonth, setstartmonth] = useState(1);
  const [endmonth, setendmonth] = useState(12);
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [selectedUnit, setselectedUnit] = useState(null);
  const [selectedDistrict, setselectedDistrict] = useState(null);
  const [selectedTehsil, setselectedTehsil] = useState(null);
  const [selectedMin, setSelectedMin] = useState(-3);
  const [selectedMax, setSelectedMax] = useState(3);
  const [unit, setUnit] = useState("units");
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [loggedin, setloggedin] = useState(false);
  const [startYear, setstartYear] = useState(dayjs().year());
  const [endYear, setendYear] = useState(dayjs().year());
  const [enddefaultDate, setenddefaultDate] = useState(
    dayjs().subtract(1, "month").startOf("month")
  );
  const [startDate, setStartDate] = useState(dayjs().startOf("year"));

  const [drawnFeature, setDrawnFeature] = useState([]);
  const [boundarySelect, setBoundarySelect] = useState(0);

  const generateMapPDF = async () => {
    setPrintLoading(true);
    setCollapsed(true);

    try {
      const mapContainer = document.querySelector(".leaflet-container");
      if (!mapContainer) throw new Error("Map container not found");

      // Gather metadata
      const indicators = [];
      if (selected)
        indicators.push(
          indicesNames.find((obj) => obj[selected])?.[selected] || selected
        );
      if (selectedTwo)
        indicators.push(
          indicesNames.find((obj) => obj[selectedTwo])?.[selectedTwo] ||
            selectedTwo
        );

      const dateRange =
        startDate && enddefaultDate
          ? `${startDate.format("MMM YYYY")} - ${enddefaultDate.format(
              "MMM YYYY"
            )}`
          : "";

      const regionInfo = [];
      if (selectedUnit) regionInfo.push(selectedUnit);
      if (selectedDistrict) regionInfo.push(selectedDistrict);
      if (selectedTehsil) regionInfo.push(selectedTehsil);

      // Handle map rendering for PDF
      const originalStyles = {
        sidebar: document.querySelector(".sidebar")?.style.display,
        controls: document.querySelector(".leaflet-control-container")?.style
          .display,
      };

      // Hide UI elements
      if (originalStyles.sidebar !== undefined) {
        document.querySelector(".sidebar").style.display = "none";
      }
      if (originalStyles.controls !== undefined) {
        document.querySelector(".leaflet-control-container").style.display =
          "none";
      }

      const wfsLayer = document.querySelector(".leaflet-overlay-pane");
      let currentBounds;

      if (mapRef.current) {
        currentBounds = mapRef.current.getBounds();
      }

      if (wfsLayer) {
        wfsLayer.style.display = "none";
      }

      // Add WMS layer
      let wmsLayer = null;
      if (mapRef.current && currentBounds) {
        let wmsUrl = "../geoserver/PakDMS/wms";
        let wmsParams = {
          service: "WMS",
          version: "1.1.0",
          request: "GetMap",
          layers: `PakDMS:${unit}`,
          styles: "",
          format: "image/png",
          transparent: true,
          zIndex: 1000,
        };

        if (unit === "districts" && selectedUnit) {
          wmsParams.cql_filter = `unit='${selectedUnit}'`;
        } else if (unit === "tehsils" && selectedDistrict) {
          wmsParams.cql_filter = `district='${selectedDistrict}'`;
        } else if (unit === "subtehsil" && selectedTehsil) {
          wmsParams.cql_filter = `district='${selectedDistrict}' AND name='${selectedTehsil}'`;
        }

        wmsLayer = L.tileLayer.wms(wmsUrl, wmsParams);
        wmsLayer.addTo(mapRef.current);

        await new Promise((resolve) => {
          if (wmsLayer.isLoading) {
            wmsLayer.once("load", resolve);
          } else {
            setTimeout(resolve, 1000);
          }
        });

        mapRef.current.invalidateSize();
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Capture map
      const scale = printOptions.quality === "high" ? 2 : 1;
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        scale: scale,
        width: mapContainer.clientWidth,
        height: mapContainer.clientHeight,
        ignoreElements: (element) => {
          return (
            element.classList.contains("sidebar") ||
            element.classList.contains("leaflet-control-container")
          );
        },
        onclone: (clonedDoc) => {
          const clonedMap = clonedDoc.querySelector(".leaflet-container");
          if (clonedMap) {
            clonedMap.style.visibility = "visible";
            clonedMap.style.width = "100%";
            clonedMap.style.height = "100%";
          }
        },
      });

      // Cleanup
      if (mapRef.current && wmsLayer) {
        mapRef.current.removeLayer(wmsLayer);
      }

      if (wfsLayer) {
        wfsLayer.style.display = "";
      }

      if (originalStyles.sidebar !== undefined) {
        document.querySelector(".sidebar").style.display =
          originalStyles.sidebar;
      }
      if (originalStyles.controls !== undefined) {
        document.querySelector(".leaflet-control-container").style.display =
          originalStyles.controls;
      }

      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }

      // PDF generation
      const orientation = printOptions.orientation;
      const isPortrait = orientation === "portrait";

      const paperSizes = {
        a4: isPortrait ? [210, 297] : [297, 210],
        letter: isPortrait ? [216, 279] : [279, 216],
        a3: isPortrait ? [297, 420] : [420, 297],
      };

      const [pdfWidth, pdfHeight] = paperSizes[printOptions.paperSize];

      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: printOptions.paperSize,
      });

      // Template design constants
      const margin = 10;
      const headerHeight = 20;
      const headerBlueColor = [0, 51, 102]; // Dark blue
      const borderColor = [0, 0, 0]; // Black
      const borderWidth = 0.3;
      const footerHeight = 10;

      // Draw white background (no need to explicitly add this as PDF is white by default)

      // Draw blue header bar
      pdf.setFillColor(...headerBlueColor);
      pdf.rect(0, 0, pdfWidth, headerHeight, "F");

      // Add logos on header
      const logoHeight = 10;
      const leftLogosWidth = 30;
      const rightLogosWidth = 25;

      try {
        // Left side logos
        const leftLogos = [logoImages.pakdms, logoImages.iwmi];
        leftLogos.forEach((logoImg, index) => {
          pdf.addImage(
            logoImg,
            "PNG",
            margin + index * (leftLogosWidth + 5),
            (headerHeight - logoHeight) / 2,
            leftLogosWidth,
            logoHeight
          );
        });

        // Right side logos
        const rightLogos = [
          logoImages.pmd,
          logoImages.ukaid,
          logoImages.wapor,
          logoImages.punjab,
          logoImages.ndrmf,
        ];
        const rightStartX = pdfWidth - margin - 5 * rightLogosWidth - 4 * 5;
        rightLogos.forEach((logoImg, index) => {
          pdf.addImage(
            logoImg,
            "PNG",
            rightStartX + index * (rightLogosWidth + 5),
            (headerHeight - logoHeight) / 2,
            rightLogosWidth,
            logoHeight
          );
        });
      } catch (error) {

      }

      // Track current vertical position
      let yPos = headerHeight + 10;

      // Add title
      pdf.setTextColor(0, 0, 0); // Black text
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(printOptions.title, pdfWidth / 2, yPos, { align: "center" });
      yPos += 10;

      // Timestamp
      if (printOptions.includeTimestamp) {
        const now = new Date();
        const timestamp = `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(timestamp, pdfWidth / 2, yPos, { align: "center" });
        yPos += 6;
      }

      // Add border around metadata section
      const metadataStartY = yPos;
      let metadataHeight = 0;

      // Count how many metadata elements we have to calculate section height
      let metadataCount = 0;
      if (indicators.length > 0) metadataCount++;
      if (dateRange) metadataCount++;
      if (regionInfo.length > 0) metadataCount++;

      // Calculate metadata section height
      metadataHeight = metadataCount * 5 + (metadataCount > 0 ? 5 : 0);

      // Draw metadata box with border
      if (metadataCount > 0) {
        // Draw metadata box with border
        // pdf.setDrawColor(...borderColor);
        // pdf.setLineWidth(borderWidth);
        // pdf.rect(margin, yPos - 2, pdfWidth - margin * 2, metadataHeight, "D");

        // Add metadata content
        pdf.setFontSize(10);
        const infoX = margin + 5;
        const labelWidth = 40;

        // Add indicator info
        if (indicators.length > 0) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Indicators:", infoX, yPos);
          pdf.setFont("helvetica", "normal");
          pdf.text(indicators.join(" vs "), infoX + labelWidth, yPos);
          yPos += 5;
        }

        // Add date range
        if (dateRange) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Period:", infoX, yPos);
          pdf.setFont("helvetica", "normal");
          pdf.text(dateRange, infoX + labelWidth, yPos);
          yPos += 5;
        }

        // Add region info
        if (regionInfo.length > 0) {
          pdf.setFont("helvetica", "bold");
          pdf.text("Region:", infoX, yPos);
          pdf.setFont("helvetica", "normal");
          pdf.text(regionInfo.join(" > "), infoX + labelWidth, yPos);
          yPos += 5;
        }

        yPos += 5; // Add some space after metadata box
      }

      // Draw map section with border
      const imgData = canvas.toDataURL("image/png");
      const mapStartY = yPos;

      // Calculate available space for map
      const availableHeight = pdfHeight - yPos - footerHeight;
      const availableWidth = pdfWidth - margin * 2;

      // Calculate map dimensions preserving aspect ratio
      let imgWidth = availableWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Adjust if map is too tall
      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      // Calculate left margin to center the map
      const leftMargin =
        imgWidth < availableWidth
          ? margin + (availableWidth - imgWidth) / 2
          : margin;

      // Draw border around map (slightly larger than the map)
      // pdf.setDrawColor(...borderColor);
      // pdf.setLineWidth(borderWidth);
      // pdf.rect(leftMargin - 1, yPos - 1, imgWidth + 2, imgHeight + 2, "D");

      // Add the map image
      pdf.addImage(imgData, "PNG", leftMargin, yPos, imgWidth, imgHeight);

      yPos += imgHeight + 5;

      // Legend section
      if (printOptions.includeLegend && (layerPalette || layerTwoPalette)) {
        // Check if we need a new page for the legend
        if (yPos > pdfHeight - 30) {
          // Add new page with header
          pdf.addPage();
          // Draw blue header bar on new page
          pdf.setFillColor(...headerBlueColor);
          pdf.rect(0, 0, pdfWidth, headerHeight, "F");
          yPos = headerHeight + 10;
        }

        // Draw legend title
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Legend", pdfWidth / 2, yPos, { align: "center" });
        yPos += 8;

        // Legend section border start
        const legendStartY = yPos;
        let legendHeight = 0;

        // Calculate legend section height
        if (selected && layerPalette) {
          legendHeight += 17; // Title + gradient + values
        }
        if (selectedTwo && layerTwoPalette) {
          legendHeight += 17; // Title + gradient + values
        }

        // Draw border around legend section
        if (legendHeight > 0) {
          pdf.setDrawColor(...borderColor);
          pdf.setLineWidth(borderWidth);
          pdf.rect(
            margin,
            legendStartY - 3,
            pdfWidth - margin * 2,
            legendHeight + 6,
            "D"
          );
        }

        // First legend
        if (selected && layerPalette) {
          const legendName =
            indicesNames.find((obj) => obj[selected])?.[selected] || selected;
          pdf.setFontSize(10);
          pdf.text(legendName, margin + 5, yPos);
          yPos += 5;

          const legendWidth = availableWidth - 10;
          const legendHeight = 8;

          // Draw color gradient
          for (let i = 0; i < layerPalette.length; i++) {
            const boxWidth = legendWidth / layerPalette.length;
            const x = margin + 5 + i * boxWidth;

            // Parse hex color to RGB for jsPDF
            const hex = layerPalette[i];
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            pdf.setFillColor(r, g, b);
            pdf.rect(x, yPos, boxWidth, legendHeight, "F");
          }

          // Add border around gradient
          pdf.setDrawColor(...borderColor);
          pdf.setLineWidth(borderWidth);
          pdf.rect(margin + 5, yPos, legendWidth, legendHeight, "D");

          // Min and max values
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(8);
          pdf.text(`${layermin}`, margin + 5, yPos + legendHeight + 4);
          pdf.text(
            `${layermax}`,
            margin + 5 + legendWidth,
            yPos + legendHeight + 4,
            { align: "right" }
          );

          yPos += legendHeight + 8;
        }

        // Second legend
        if (selectedTwo && layerTwoPalette) {
          const legendName =
            indicesNames.find((obj) => obj[selectedTwo])?.[selectedTwo] ||
            selectedTwo;
          pdf.setFontSize(10);
          pdf.text(legendName, margin + 5, yPos);
          yPos += 5;

          const legendWidth = availableWidth - 10;
          const legendHeight = 8;

          // Draw color gradient
          for (let i = 0; i < layerTwoPalette.length; i++) {
            const boxWidth = legendWidth / layerTwoPalette.length;
            const x = margin + 5 + i * boxWidth;

            // Parse hex color to RGB for jsPDF
            const hex = layerTwoPalette[i];
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            pdf.setFillColor(r, g, b);
            pdf.rect(x, yPos, boxWidth, legendHeight, "F");
          }

          // Add border around gradient
          pdf.setDrawColor(...borderColor);
          pdf.setLineWidth(borderWidth);
          pdf.rect(margin + 5, yPos, legendWidth, legendHeight, "D");

          // Min and max values
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(8);
          pdf.text(`${layermin}`, margin + 5, yPos + legendHeight + 4);
          pdf.text(
            `${layermax}`,
            margin + 5 + legendWidth,
            yPos + legendHeight + 4,
            { align: "right" }
          );
        }
      }

      // Draw footer with border
      // pdf.setDrawColor(...borderColor);
      // pdf.setLineWidth(borderWidth);
      // pdf.rect(0, pdfHeight - footerHeight, pdfWidth, footerHeight, "D");

      // Add footer text
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        "Generated using PakDMS",
        pdfWidth / 2,
        pdfHeight - footerHeight / 2,
        {
          align: "center",
        }
      );

      // Save the PDF
      const now = new Date();
      const fileName = `PakDMS-PDF-REPORT-${now
        .toISOString()
        .slice(0, 10)}.pdf`;
      pdf.save(fileName);

      // Success notification
      openNotificationWithIcon(
        "success",
        "PDF Generated Successfully",
        `Your map has been exported as ${fileName}`,
        "bottomRight"
      );
    } catch (error) {

      openNotificationWithIcon(
        "error",
        "Error Generating PDF",
        "There was an error creating your PDF. Please try again.",
        "bottomRight"
      );
    } finally {
      setPrintLoading(false);
      setPrintModalVisible(false);
      setCollapsed(false);
    }
  };

  const handlePrintButtonClick = () => {
    setPrintOptions({
      ...printOptions,
      title: `Pakistan Drought Management System ${
        selected ? ` - ${selected}` : ""
      }`,
    });
    setPrintModalVisible(true);
  };

  const handleCancelRequest = () => {
    if (cancelRequestFunction) {
      cancelRequestFunction();
      openNotificationWithIcon(
        "info",
        "Request cancelled",
        "The current operation has been cancelled",
        "bottomRight"
      );
    }
  };

  const onClose = () => {
    setshowGraph(false);
  };

  const getdistricts = (e) => {
    let temp = [];
    e.forEach((feat) => {
      temp.push({ value: feat.properties.name, label: feat.properties.name });
    });
    temp.sort(function (a, b) {
      if (a.value < b.value) {
        return -1;
      }
      if (a.value > b.value) {
        return 1;
      }
      return 0;
    });
    setDistricts(temp);
  };

  const gettehsils = (e) => {
    let temp = [];
    e.forEach((feat) => {
      temp.push({ value: feat.properties.name, label: feat.properties.name });
    });
    temp.sort(function (a, b) {
      if (a.value < b.value) {
        return -1;
      }
      if (a.value > b.value) {
        return 1;
      }
      return 0;
    });
    setTehsils(temp);
  };

  const clickedUnit = (e) => {
    dispatch(setshowTour(false));
    setloadlayer(false);
    setshowOpacity(false);
    setreset(true);
    if (e.level === 1) {
      setUnit("districts");
      setselectedUnit(e.name);
    }
    if (e.level === 2) {
      setUnit("tehsils");
      setselectedDistrict(e.name);
    }
    if (e.level === 3) {
      setUnit("subtehsil");
      setselectedTehsil(e.name);
    }
  };

  useEffect(() => {
    dispatch(setSelected(null));
    dispatch(setSelectedTwo(null));
    dispatch(setSelectedWapor(null));
    setcolor(!darkmode ? "#fff" : "#000");
    document.documentElement.style.setProperty(
      "--ll-color",
      !darkmode ? "#000" : "#fff"
    );
    document.documentElement.style.setProperty(
      "--ll-background-color",
      darkmode ? "#000" : "#fff"
    );
    Axios.get("../backend/logincheck", {
      headers: {
        "access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      if (response.data.auth) {
        setloggedin(true);
        navigate("/map");
        setLoading(false);
        dispatch(setLoggedIn(true));
      } else {
        dispatch(setLoggedIn(false));
        dispatch(setselectedKey(null));
        setLoading(true);
        setloggedin(false);
        navigate("/login");
      }
    });
  }, [darkmode, dispatch, module, navigate]);

  useEffect(() => {
    if (admin1 && admin1Name) setselectedUnit(admin1Name);
  }, []);

  const sliderChange = useCallback((e) => {
    setOpac(e);
  }, []);

  const resetAll = (e) => {
    if (e !== "draw") {
      setselectedTehsil(null);
      setUnit("units");
      setselectedUnit(null);
      setDistricts([]);
      setTehsils([]);
      setselectedDistrict(null);
      setselectedTehsil(null);
      setreset(false);
    }
    setlegend(false);
    setloadlayer(false);
    setshowGraph(false);
    setshowOpacity(false);
    dispatch(setSelected(null));
    dispatch(setSelectedTwo(null));
    setshowprecipitation(false);
    setshowmonths(false);
  };

  return (
    <>
      {contextHolder}
      <Spin
        indicator={
          <Box sx={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                alt="revolving globe"
                src="https://media.tenor.com/4NKYe36DcE8AAAAj/taclan-world.gif"
                style={{ marginLeft: 40, width: 75, height: 75 }}
                spin="true"
              />
              <img
                alt="loading dots"
                src="https://media.tenor.com/mT5Timqns1sAAAAi/loading-dots-bouncing-dots.gif"
                style={{ width: 150, height: 75 }}
                spin="true"
              />
              {/* Progress Bar */}
              {progress > 0 && (
                <div style={{ width: "100%", marginTop: 10, marginBottom: 5 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 5,
                      fontSize: "20px",
                    }}
                  >
                    <span>{progress}%</span>
                  </div>
                </div>
              )}
              {cancelRequestFunction && (
                <Button
                  type="primary"
                  danger
                  onClick={handleCancelRequest}
                  style={{ marginTop: 10 }}
                >
                  Cancel Request
                </Button>
              )}
            </div>
          </Box>
        }
        spinning={loading}
      >
        <Layout style={{ padding: "0", margin: "0", height: "100vh" }}>
          <Header style={headerStyle}>
            <HeaderMap heading={props.heading} loggedin={loggedin} />
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
                background: color,
                borderRight: "1px solid black",
              }}
              collapsible
              collapsed={collapsed}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ display: "flex" }}
              >
                <div ref={ref4}>
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
                      if (value === "forecast") {
                        navigate("/forecast");
                      } else {
                        navigate("/map");
                      }
                    }}
                    options={[
                      {
                        value: "monitoring",
                        label: "Drought Monitoring",
                      },
                      {
                        value: "forecast",
                        label: "Forecast",
                      },
                    ]}
                  />
                </div>
                <Space direction="vertical" ref={ref5}>
                  <p className="sidebar-module">
                    <FontAwesomeIcon icon={faListOl} />
                    &nbsp;&nbsp;&nbsp;&nbsp;Selection Type
                  </p>
                  <Radio.Group
                    onChange={(e) => {
                      setBoundarySelect(e.target.value);
                    }}
                    value={boundarySelect}
                  >
                    <Space direction="vertical">
                      <Radio value={0}>Interactive</Radio>
                      <Radio value={1}>Upload</Radio>
                      <Radio value={2}>Draw</Radio>
                    </Space>
                  </Radio.Group>
                  {boundarySelect === 0 ? (
                    <>
                      <p className="sidebar-module">
                        <FontAwesomeIcon icon={faObjectGroup} />
                        &nbsp;&nbsp;&nbsp;&nbsp;Region
                      </p>
                      <Select
                        placeholder="Select a unit"
                        optionFilterProp="children"
                        onChange={(e) => {
                          setreset(true);
                          setloadlayer(false);
                          setshowOpacity(false);
                          setselectedUnit(e);
                          setselectedDistrict(null);
                          setselectedTehsil(null);
                          setDistricts([]);
                          setTehsils([]);
                          setUnit("districts");

                          // fetch districts for the selected province and populate dropdown
                          setDistrictsLoading(true);
                          Axios.get("../geoserver/ows", {
                            params: {
                              service: "WFS",
                              version: "1.0.0",
                              request: "GetFeature",
                              typeName: "PakDMS:districts",
                              outputFormat: "application/json",
                              CQL_FILTER: `unit='${e}'`,
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
                        value={admin1 ? admin1Name : selectedUnit}
                        options={[
                          {
                            value: "AZAD KASHMIR",
                            label: "AZAD KASHMIR",
                            disabled: admin1 && admin1Name !== "AZAD KASHMIR",
                          },
                          {
                            value: "BALOCHISTAN",
                            label: "BALOCHISTAN",
                            disabled: admin1 && admin1Name !== "BALOCHISTAN",
                          },
                          {
                            value: "GILGIT BALTISTAN",
                            label: "GILGIT BALTISTAN",
                            disabled:
                              admin1 && admin1Name !== "GILGIT BALTISTAN",
                          },
                          {
                            value: "FEDERAL CAPITAL TERRITORY",
                            label: "FEDERAL CAPITAL TERRITORY",
                            disabled:
                              admin1 &&
                              admin1Name !== "FEDERAL CAPITAL TERRITORY",
                          },
                          {
                            value: "KHYBER PAKHTUNKHWA",
                            label: "KHYBER PAKHTUNKHWA",
                            disabled:
                              admin1 && admin1Name !== "KHYBER PAKHTUNKHWA",
                          },
                          {
                            value: "PUNJAB",
                            label: "PUNJAB",
                            disabled: admin1 && admin1Name !== "PUNJAB",
                          },
                          {
                            value: "SINDH",
                            label: "SINDH",
                            disabled: admin1 && admin1Name !== "SINDH",
                          },
                        ]}
                      />
                      {selectedUnit || (admin1 && admin2) ? (
                        <>
                          <Select
                            placeholder="Select a district"
                            onChange={(e) => {
                              setreset(true);
                              setloadlayer(false);
                              setshowOpacity(false);
                              setselectedDistrict(e);
                              setselectedTehsil(null);
                              setTehsils([]);
                              setUnit("tehsils");

                              // fetch tehsils for the selected district
                              setTehsilsLoading(true);
                              Axios.get("../geoserver/ows", {
                                params: {
                                  service: "WFS",
                                  version: "1.0.0",
                                  request: "GetFeature",
                                  typeName: "PakDMS:tehsils",
                                  outputFormat: "application/json",
                                  CQL_FILTER: `district='${e}'`,
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
                            disabled={admin2 ? true : false}
                            value={admin2 ? admin2Name : selectedDistrict}
                            loading={districtsLoading}
                            options={districts}
                          />
                        </>
                      ) : (
                        ""
                      )}
                      {selectedDistrict ? (
                        <>
                          <Select
                            placeholder="Select a tehsil"
                            onChange={(e) => {
                              setreset(true);
                              setloadlayer(false);
                              setshowOpacity(false);
                              setselectedTehsil(e);
                              setUnit("subtehsil");
                            }}
                            value={selectedTehsil}
                            loading={tehsilsLoading}
                            options={tehsils}
                          />
                        </>
                      ) : (
                        ""
                      )}
                    </>
                  ) : (
                    ""
                  )}
                  {reset ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        resetAll("btn");
                      }}
                    >
                      Reset
                    </Button>
                  ) : (
                    ""
                  )}
                </Space>
                <div ref={ref6}>
                  <p className="sidebar-module">
                    <FontAwesomeIcon icon={faObjectGroup} />
                    &nbsp;&nbsp;&nbsp;&nbsp;Indicators
                  </p>
                  <Collapse bordered={false} accordion>
                    <Panel
                      header={
                        <Flex
                          justify="space-between"
                          style={{
                            color: selected
                              ? darkmode
                                ? "#1668dc"
                                : "#1668dc"
                              : "",
                          }}
                        >
                          <div className="column" style={{ width: "100%" }}>
                            <span>Indices</span>
                          </div>
                          <div className="column third-column">
                            <FontAwesomeIcon icon={faListCheck} />
                          </div>
                        </Flex>
                      }
                    >
                      <Indices
                        setloadlayer={setloadlayer}
                        setshowOpacity={setshowOpacity}
                        setshowGraph={setshowGraph}
                        setshowprecipitation={setshowprecipitation}
                        setshowmonths={setshowmonths}
                        setapplyBtn={setapplyBtn}
                        setgraphBtn={setgraphBtn}
                        setlegend={setlegend}
                        minDate={minDate}
                        openNotificationWithIcon={openNotificationWithIcon}
                        setmodalMessage={setmodalMessage}
                        setmodalopen={setmodalopen}
                        compare={comparisonOn}
                        setSelectedMin={setSelectedMin}
                        setSelectedMax={setSelectedMax}
                        setLayerURL={setLayerURL}
                      />
                    </Panel>
                    {/* <Panel
                      header={
                        <Flex
                          justify="space-between"
                          style={{
                            color: selectedWapor
                              ? darkmode
                                ? "#1668dc"
                                : "#1668dc"
                              : "",
                          }}
                        >
                          <div className="column" style={{ width: "100%" }}>
                            <span>WaPOR Datasets</span>
                          </div>
                          <div className="column third-column">
                            <FontAwesomeIcon icon={faWater} />
                          </div>
                        </Flex>
                      }
                    >
                      <WaporIndices
                        setloadlayer={setloadlayer}
                        setshowOpacity={setshowOpacity}
                        setshowGraph={setshowGraph}
                        setshowprecipitation={setshowprecipitation}
                        setshowmonths={setshowmonths}
                        setapplyBtn={setapplyBtn}
                        setgraphBtn={setgraphBtn}
                        setlegend={setlegend}
                        minDate={minDate}
                      />
                    </Panel> */}
                  </Collapse>
                </div>

                <div ref={ref1}>
                  <p className="sidebar-module">
                    <FontAwesomeIcon icon={faCalendar} />
                    &nbsp;&nbsp;&nbsp;&nbsp; Start Date
                  </p>
                  <DatePicker
                    picker="month"
                    allowClear={false}
                    defaultValue={startDate}
                    disabledDate={(current) => {
                      const today = dayjs();
                      return (
                        (current && current < minDate) ||
                        (current && current > today.endOf("month"))
                      );
                    }}
                    format="MMM YYYY"
                    onChange={(e) => {


                      setStartDate(e);
                      setrefresh(false);
                      setloadlayer(false);
                      setshowOpacity(false);
                      setshowGraph(false);

                      setstartmonth(parseInt(e.get("month") + 1));

                      // Keep endmonth as current month, don't change it when start date changes
                      // Only update if the end date needs to be adjusted to be >= start date
                      const currentMonth = parseInt(dayjs().month() + 1);
                      const startMonth = parseInt(e.get("month") + 1);
                      const startYear = e.get("year");
                      const currentYear = dayjs().year();

                      // Only update endmonth if current end date would be before the new start date
                      if (
                        endYear < startYear ||
                        (endYear === startYear && endmonth < startMonth)
                      ) {
                        setendmonth(currentMonth);
                        setendYear(currentYear);
                        setenddefaultDate(
                          dayjs().subtract(1, "month").startOf("month")
                        );
                      }

                      setstartYear(startYear);
                    }}
                  />
                </div>
                <div ref={ref2}>
                  <p className="sidebar-module">
                    <FontAwesomeIcon icon={faCalendar} />
                    &nbsp;&nbsp;&nbsp;&nbsp;End Date
                  </p>
                  <DatePicker
                    picker="month"
                    value={enddefaultDate}
                    disabledDate={(current) => {
                      const minDate = startDate.startOf("month");
                      const today = dayjs().endOf("month");
                      return current && (current < minDate || current > today);
                    }}
                    format="MMM YYYY"
                    allowClear={false}
                    onChange={(e) => {


                      setrefresh(false);
                      setloadlayer(false);
                      setshowOpacity(false);
                      setshowGraph(false);

                      setendmonth(parseInt(e.get("month") + 1));

                      // Fix: Ensure we're setting the year correctly
                      const selectedYear = e.get("year");

                      setendYear(selectedYear);

                      let newEndDate = dayjs()
                        .year(selectedYear)
                        .month(e.get("month"));
                      setenddefaultDate(newEndDate);
                    }}
                  />
                </div>
                {/* {selected || selectedWapor ? null : null} */}
                <div ref={ref3}>
                  <p className="sidebar-module">
                    <FontAwesomeIcon icon={faCalculator} />
                    &nbsp;&nbsp;&nbsp;&nbsp;Aggregation
                  </p>
                  <Select
                    showSearch
                    disabled={selected === "DrySpell" ? true : false}
                    placeholder="Select a calculation value"
                    optionFilterProp="children"
                    defaultValue={calcval}
                    options={[
                      {
                        value: "mean",
                        label: "Mean",
                      },
                      {
                        value: "median",
                        label: "Median",
                      },
                      {
                        value: "min",
                        label: "Minimum",
                      },
                      {
                        value: "max",
                        label: "Maximum",
                      },
                    ]}
                    onChange={(e) => {
                      if (selected) {
                        setcalcval(e);
                        setloadlayer(false);
                        setshowOpacity(false);
                        setshowGraph(false);
                      }
                    }}
                  />
                </div>
                <div>
                  <Space direction="vertical">
                    <p className="sidebar-module">
                      <FontAwesomeIcon icon={faCircleMinus} />
                      &nbsp;&nbsp;&nbsp;&nbsp;Min
                    </p>
                    <InputNumber
                      min={-5}
                      step={0.1}
                      max={10}
                      value={selectedMin}
                      onChange={(e) => setSelectedMin(e)}
                    />
                    <p className="sidebar-module">
                      <FontAwesomeIcon icon={faCirclePlus} />
                      &nbsp;&nbsp;&nbsp;&nbsp;Max
                    </p>
                    <InputNumber
                      min={-5}
                      step={0.1}
                      max={10}
                      value={selectedMax}
                      onChange={(e) => setSelectedMax(e)}
                    />
                  </Space>
                </div>

                {layerURL.length >= 1 ? (
                  <div>
                    <p className="sidebar-module">
                      <FontAwesomeIcon icon={faCodeCompare} />
                      &nbsp;&nbsp;&nbsp;&nbsp;Compare
                    </p>
                    <Switch
                      checkedChildren={"✓"}
                      unCheckedChildren={"X"}
                      defaultChecked={comparisonOn}
                      onChange={(e) => {
                        const button =
                          document.getElementById("sm-exit-button");
                        if (button) {
                          button.click();
                        }

                        if (!e) {
                          dispatch(setSelectedTwo(null));
                          if (layerURL.length > 1) {
                            setLayerURL((prevLayerURL) =>
                              prevLayerURL.slice(0, -1)
                            );
                          }
                        }
                        setloadlayer(true);
                        setComparisonOn(e);
                      }}
                    />
                  </div>
                ) : (
                  ""
                )}
                {showprecipitation ? (
                  <>
                    <p className="sidebar-module">
                      Precipitation Threshold (mm)
                    </p>
                    <InputNumber
                      min={1}
                      max={50}
                      step={0.5}
                      defaultValue={2.5}
                      onChange={(e) => {
                        setprecipitation(e);
                        setloadlayer(false);
                        setshowOpacity(false);
                      }}
                    />
                  </>
                ) : (
                  ""
                )}
                {showmonths ? (
                  <>
                    <p className="sidebar-module">Months</p>
                    <Select
                      placeholder="Select month"
                      onChange={(e) => {
                        setmonths(e);
                        setloadlayer(false);
                        setshowOpacity(false);
                      }}
                      value={months}
                      options={[
                        {
                          value: "1",
                          label: "1",
                        },
                        {
                          value: "3",
                          label: "3",
                        },
                        {
                          value: "6",
                          label: "6",
                        },
                        {
                          value: "12",
                          label: "12",
                        },
                      ]}
                    />
                  </>
                ) : (
                  ""
                )}

                <Space ref={ref7} direction="horizontal" size="small">
                  <Button
                    type="primary"
                    disabled={applyBtn}
                    onClick={() => {
                      if (
                        !selectedUnit &&
                        boundarySelect === 0 &&
                        (admin1 || admin2)
                      ) {
                        openNotificationWithIcon(
                          "info",
                          "Please select an administrative unit",
                          "",
                          "bottomRight"
                        );
                        return;
                      }
                      // Start the progress
                      setProgress(25);

                      // Simulate progress updates
                      const timer1 = setTimeout(() => setProgress(50), 1500);
                      const timer2 = setTimeout(() => setProgress(75), 3000);

                      setloadlayer(true);
                      setshowOpacity(true);
                      setshowGraph(false);
                      setLoading(true);
                      setlegend(false);
                      setlayermin(null);
                      setlayermax(null);
                      setlayerPalette(null);
                      setLayerLegend(null);
                      setLayerLegendTwo(null);
                      setrefresh(true);
                      setcalctype("map");

                      // Clean up timers in case the operation is canceled
                      return () => {
                        clearTimeout(timer1);
                        clearTimeout(timer2);
                      };
                    }}
                    icon={<FontAwesomeIcon icon={faLayerGroup} />}
                  >
                    Apply
                  </Button>
                  <Button
                    disabled={!graphBtn}
                    onClick={() => {
                      if (
                        !selectedUnit &&
                        boundarySelect === 0 &&
                        (admin1 || admin2)
                      ) {
                        openNotificationWithIcon(
                          "info",
                          "Please select an administrative unit",
                          "",
                          "bottomRight"
                        );
                        return;
                      }
                      // setGraphModal(!graphModal);

                      setGraphModal(false);
                      setcalctype("table");
                      setshowGraph(true);
                      setLoading(true);
                      setrefresh(true);
                      setlegend(false);
                      setloadlayer(false);
                      setshowOpacity(false);
                    }}
                    icon={<FontAwesomeIcon icon={faChartLine} />}
                  >
                    Graph
                  </Button>
                </Space>
              </Space>
            </Sider>
            <Content ref={ref0} style={contentStyle}>
              <MapContainer
                center={center}
                zoom={zoom}
                className="map-container"
                maxZoom={27}
                loadingControl={true}
                ref={mapRef}
              >
                <Control position="topleft">
                  <Button
                    icon={<FontAwesomeIcon icon={faPrint} />}
                    onClick={handlePrintButtonClick}
                    title="Export Map as PDF"
                    style={{
                      fontSize: "16px",
                    }}
                  />
                </Control>
                <AddMask
                  selectedUnit={selectedUnit}
                  selectedDistrict={selectedDistrict}
                  selectedTehsil={selectedTehsil}
                  unit={unit}
                />
                {legendLULC ? (
                  <Control prepend position="bottomleft">
                    <LULCLegend legendLULC={(e) => setlegendLULC(e)} />
                  </Control>
                ) : null}
                <Control prepend position="topleft">
                  <Button
                    icon={
                      collapsed ? (
                        <FontAwesomeIcon icon={faAnglesRight} />
                      ) : (
                        <FontAwesomeIcon icon={faAnglesLeft} />
                      )
                    }
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                      fontSize: "16px",
                    }}
                  />
                  {boundarySelect === 1 ? <UploadShapefile /> : null}
                  {}
                </Control>
                {boundarySelect === 2 ? (
                  <DrawTools
                    resetAll={resetAll}
                    setDrawnFeature={setDrawnFeature}
                    drawnFeature={drawnFeature}
                    setloadlayer={setloadlayer}
                    setSelected={setSelected}
                    setSelectedWapor={setSelectedWapor}
                    setreset={setreset}
                  />
                ) : null}
                <LayersControl position="topleft">
                  <LayersControl.BaseLayer
                    name="Google Satellite"
                    checked={false}
                  >
                    <LayerGroup name=" Google Satellite">
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
                  <LayersControl.Overlay
                    checked={false}
                    name="Sentinel LULC"
                    onChange={(e) => {
                      const isChecked = e.target.checked; // Detect if the layer is checked
                      setlegendLULC(isChecked);


                    }}
                  >
                    {loggedin ? (
                      <SentinelLULC
                        error={(msg) => {
                          openNotificationWithIcon(
                            "error",
                            msg,
                            "",
                            "bottomRight"
                          );
                          setLoading(false);
                        }}
                      />
                    ) : (
                      ""
                    )}
                  </LayersControl.Overlay>
                  <LayersControl.Overlay checked name="Earth Engine Layer">
                    {loadlayer ? (
                      <>
                        <EarthEngine
                          res={(val) => {
                            setLayerURL((prevLayerURL) => {
                              const updatedLayerURL =
                                prevLayerURL.length === 2
                                  ? prevLayerURL.slice(0, -1)
                                  : prevLayerURL;

                              // Append the new value
                              return [...updatedLayerURL, val];
                            });

                            // setapplyBtn(true);
                            setshowOpacity(true);
                            if (selected) {
                              setlayerPalette(val.palette);
                              setLayerLegend(val.legend || null);
                            }
                            if (selectedTwo) {
                              setlayerTwoPalette(val.palette);
                              setLayerLegendTwo(val.legend || null);
                            }
                            setlayermax(val.max);
                            setlayermin(val.min);
                            setlegend(true);
                            selected === "DrySpell"
                              ? setgraphBtn(false)
                              : setgraphBtn(true);
                            setrefresh(false);
                          }}
                          error={(msg) => {
                            openNotificationWithIcon(
                              "error",
                              msg,
                              "",
                              "bottomRight"
                            );
                            setLoading(false);
                            setlegend(false);
                          }}
                          boundarySelect={boundarySelect}
                          fileName={boundarySelect === 1 ? fileName : null}
                          drawnFeature={
                            boundarySelect === 2 ? drawnFeature : null
                          }
                          opac={opac}
                          onProgressUpdate={setProgress}
                          loading={(e) => setLoading(e)}
                          precipitation={precipitation}
                          months={months}
                          calcval={calcval}
                          refresh={refresh}
                          startmonth={startmonth}
                          endmonth={endmonth}
                          startyear={startYear}
                          endyear={endYear}
                          indicator={selected ? selected : selectedWapor}
                          indicatorTwo={
                            selectedTwo ? selectedTwo : selectedWapor
                          }
                          compare={comparisonOn}
                          selectedUnit={selectedUnit}
                          selectedDistrict={selectedDistrict}
                          selectedTehsil={selectedTehsil}
                          calctype={calctype}
                          selectedMin={selectedMin}
                          selectedMax={selectedMax}
                          setCancelFunction={setCancelRequestFunction}
                          onCancelRequest={() => {
                            setrefresh(false);
                            setapplyBtn(false);
                            setProgress(0); // Reset progress on cancel
                          }}
                        />
                        {legend && (selected || selectedWapor) ? (
                          <>
                            <div
                              style={{
                                width: "auto",
                                background: !darkmode ? "white" : "black",
                                borderRadius: "5px",
                                padding: "5px",
                                position: "fixed",
                                bottom: "15px",
                                right: "15px",
                                zIndex: 5000,
                                color: !darkmode ? "black" : "white",
                                textAlign: "center",
                                fontSize : "20px",
                              }}
                            >
                              <span className="bg-gradient-to-r from-white to-transparent bg-clip-text text-transparent">
                                {indicesNames.find(
                                  (obj) => obj[selected || selectedWapor]
                                )
                                  ? indicesNames.find(
                                      (obj) => obj[selected || selectedWapor]
                                    )[selected || selectedWapor]
                                  : "Not Found"}
                              </span>
                              <br />

                              <span>{/* {startdate} to {enddate} */}</span>
                              <div
                                style={{
                                  width: "auto",
                                  display: "flex",
                                  borderRadius: "5px",
                                  padding: "5px",
                                  zIndex: 5000,
                                  color: !darkmode ? "black" : "white",
                                }}
                              >
                                {layerLegend && layerLegend.isDiscrete ? (
                                  (() => {
                                    const labels = layerLegend.labels || [];
                                    const colors = layerLegend.colors || layerPalette || [];
                                    const needReverse = labels.length && (labels[0].toLowerCase() === 'extreme' || labels[0].toLowerCase().includes('extreme'));
                                    const L = needReverse ? [...labels].reverse() : labels;
                                    const C = needReverse ? [...colors].reverse() : colors;
                                    return (
                                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                          {C.map((hex, i) => (
                                            <div
                                              key={i}
                                              style={{
                                                width: "60px",
                                                height: "10px",
                                                borderRadius: "5px",
                                                backgroundColor: `#${hex}`,
                                              }}
                                            />
                                          ))}
                                        </div>
                                        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "6px" }}>
                                          {L.map((lbl, i) => {
                                            const labelText = String(lbl ?? "").trim();
                                            const match = labelText.match(/\(([^)]*)\)/);
                                            let title = match
                                              ? labelText.replace(match[0], "").trim()
                                              : labelText;
                                            if (title.toLowerCase() === "no drought") title = "Normal";
                                            let range = match ? match[0].trim() : "";
                                            if (range) {
                                              const inner = range.slice(1, -1);
                                              const parts = inner.split(/\s+to\s+/i);
                                              if (parts.length === 2) {
                                                const left = parts[0].trim();
                                                const right = parts[1].trim();
                                                if (left && right) range = `(${right} to ${left})`;
                                              }
                                            }
                                            return (
                                              <div
                                                key={i}
                                                style={{
                                                  minWidth: "60px",
                                                  textAlign: "center",
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "center",
                                                }}
                                              >
                                                <div style={{ fontSize: "13px", fontWeight: "bold" }}>{title}</div>
                                                {range ? (
                                                  <div style={{ fontSize: "11px", marginTop: "4px", whiteSpace: "nowrap" }}>
                                                    {range}
                                                  </div>
                                                ) : null}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <>
                                    <span style={{ marginRight: "5px" }}>{layermin}</span>
                                    {layerPalette ? (
                                      <div
                                        style={{
                                          width: "250px",
                                          height: "15px",
                                          background: `linear-gradient(to right, ${layerPalette
                                            .map((palette) => `#${palette}`)
                                            .join(", ")})`,
                                        }}
                                      />
                                    ) : (
                                      ""
                                    )}
                                    <span style={{ marginLeft: "5px" }}>{layermax}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          ""
                        )}
                        {comparisonOn && selectedTwo ? (
                          <>
                            <div
                              style={{
                                width: "auto",
                                background: !darkmode ? "white" : "black",
                                borderRadius: "5px",
                                padding: "5px",
                                position: "fixed",
                                bottom: "15px",
                                left: "255px",
                                zIndex: 5000,
                                color: !darkmode ? "black" : "white",
                                textAlign: "center",
                              }}
                            >
                              <span className="font-bold text-[24px] bg-gradient-to-r from-white to-transparent bg-clip-text text-transparent">
                                {indicesNames.find((obj) => obj[selectedTwo])
                                  ? indicesNames.find(
                                      (obj) => obj[selectedTwo]
                                    )[selectedTwo]
                                  : "Not Found"}
                              </span>
                              <br />

                              <span>{/* {startdate} to {enddate} */}</span>
                              <div
                                style={{
                                  width: "auto",
                                  display: "flex",
                                  borderRadius: "5px",
                                  padding: "5px",
                                  zIndex: 5000,
                                  color: !darkmode ? "black" : "white",
                                }}
                              >
                                {layerLegendTwo && layerLegendTwo.isDiscrete ? (
                                  (() => {
                                    const labels = layerLegendTwo.labels || [];
                                    const colors = layerLegendTwo.colors || layerTwoPalette || [];
                                    const needReverse = labels.length && (labels[0].toLowerCase() === 'extreme' || labels[0].toLowerCase().includes('extreme'));
                                    const L = needReverse ? [...labels].reverse() : labels;
                                    const C = needReverse ? [...colors].reverse() : colors;
                                    return (
                                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                          {C.map((hex, i) => (
                                            <div
                                              key={i}
                                              style={{
                                                width: "60px",
                                                height: "10px",
                                                borderRadius: "5px",
                                                backgroundColor: `#${hex}`,
                                              }}
                                            />
                                          ))}
                                        </div>
                                        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "6px" }}>
                                          {L.map((lbl, i) => {
                                            const labelText = String(lbl ?? "").trim();
                                            const match = labelText.match(/\(([^)]*)\)/);
                                            let title = match
                                              ? labelText.replace(match[0], "").trim()
                                              : labelText;
                                            if (title.toLowerCase() === "no drought") title = "Normal";
                                            let range = match ? match[0].trim() : "";
                                            if (range) {
                                              const inner = range.slice(1, -1);
                                              const parts = inner.split(/\s+to\s+/i);
                                              if (parts.length === 2) {
                                                const left = parts[0].trim();
                                                const right = parts[1].trim();
                                                if (left && right) range = `(${right} to ${left})`;
                                              }
                                            }
                                            return (
                                              <div
                                                key={i}
                                                style={{
                                                  minWidth: "60px",
                                                  textAlign: "center",
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "center",
                                                }}
                                              >
                                                <div style={{ fontSize: "13px", fontWeight: "bold" }}>{title}</div>
                                                {range ? (
                                                  <div style={{ fontSize: "11px", marginTop: "4px", whiteSpace: "nowrap" }}>
                                                    {range}
                                                  </div>
                                                ) : null}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <>
                                    <span style={{ marginRight: "5px" }}>{layermin}</span>
                                    {layerTwoPalette ? (
                                      <div
                                        style={{
                                          width: "250px",
                                          height: "15px",
                                          background: `linear-gradient(to right, ${layerTwoPalette
                                            .map((palette) => `#${palette}`)
                                            .join(", ")})`,
                                        }}
                                      />
                                    ) : (
                                      ""
                                    )}
                                    <span style={{ marginLeft: "5px" }}>{layermax}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          ""
                        )}
                      </>
                    ) : (
                      ""
                    )}
                  </LayersControl.Overlay>
                  <LayersControl.Overlay checked name="Boundary">
                    {loggedin && boundarySelect === 0 ? (
                      <VectorData
                        adminUnit={unit}
                        clickedUnit={clickedUnit}
                        selectedUnit={selectedUnit}
                        selectedDistrict={selectedDistrict}
                        selectedTehsil={selectedTehsil}
                        getdistricts={getdistricts}
                        gettehsils={gettehsils}
                        layers={layerURL}
                      />
                    ) : (
                      ""
                    )}
                  </LayersControl.Overlay>
                  <LayersControl.Overlay checked={true} name="Surface Water">
                    {loggedin ? (
                      <JRCLayer
                        error={(msg) => {
                          openNotificationWithIcon(
                            "error",
                            msg,
                            "",
                            "bottomRight"
                          );
                          setLoading(false);
                        }}
                      />
                    ) : (
                      ""
                    )}
                  </LayersControl.Overlay>
                </LayersControl>
                {showGraph ? (
                  <div
                    style={{
                      zIndex: 5000,
                      overflow: "hidden",
                      height: "250px",
                    }}
                  >
                    <Drawer
                      mask={false}
                      placement="bottom"
                      height={"auto"}
                      onClose={onClose}
                      open={!open}
                      getContainer={false}
                    >
                      <Graph
                        error={(msg) => {
                          openNotificationWithIcon(
                            "error",
                            msg,
                            "",
                            "bottomRight"
                          );
                          setLoading(false);
                          setshowGraph(false);
                        }}
                        graphOption={graphOption}
                        loading={(e) => setLoading(e)}
                        drawnFeature={
                          boundarySelect === 2 ? drawnFeature : null
                        }
                        precipitation={precipitation}
                        months={months}
                        calcval={calcval}
                        refresh={refresh}
                        startmonth={startmonth}
                        endmonth={endmonth}
                        startyear={startYear}
                        endyear={endYear}
                        indicator={selected ? selected : selectedWapor}
                        selectedUnit={selectedUnit}
                        selectedDistrict={selectedDistrict}
                        selectedTehsil={selectedTehsil}
                        calctype={calctype}
                        boundarySelect={boundarySelect}
                        selectedMin={selectedMin}
                        selectedMax={selectedMax}
                      />
                    </Drawer>
                  </div>
                ) : (
                  ""
                )}
                {/* Add Scalebar */}
                <ScaleControl position="bottomleft" />
                {/* Add North Arrow */}
                <NorthArrow />
                {/* Add Swipe Control */}
                {selected && selectedTwo ? (
                  <SwipeModeLayer
                    layers={layerURL}
                    leftLayerName={selected}
                    rightLayerName={selectedTwo}
                  />
                ) : null}
              </MapContainer>
              {showOpacity ? (
                <div
                  style={{
                    position: "fixed",
                    zIndex: 500,
                    bottom: "10em",
                    right: ".6em",
                    height: "10em",
                  }}
                >
                  <Slider
                    tooltip={(value) => `${value}%`}
                    marks
                    min={0}
                    max={1}
                    step={0.1}
                    vertical
                    value={opac}
                    onChange={(e) => sliderChange(e)}
                  />
                </div>
              ) : (
                ""
              )}
            </Content>
          </Layout>
        </Layout>
      </Spin>
      <Modal
        open={modalopen}
        title={modalIndice}
        onCancel={() => setmodalopen(false)}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => setmodalopen(false)}
          >
            Close
          </Button>,
        ]}
      >
        {modalMessage}
      </Modal>
      {showTour ? (
        <WebsiteTour
          ref0={ref0}
          ref1={ref1}
          ref2={ref2}
          ref3={ref3}
          ref4={ref4}
          ref5={ref5}
          ref6={ref6}
          ref7={ref7}
        />
      ) : (
        ""
      )}
      <Modal
        title="Graph Data"
        open={graphModal}
        onOk={() => {
          setGraphModal(false);
          setcalctype("table");
          setshowGraph(true);
          setLoading(true);
          setrefresh(true);
          setlegend(false);
          setloadlayer(false);
          setshowOpacity(false);
        }}
        onCancel={(e) => setGraphModal(!graphModal)}
      >
        <Radio.Group
          onChange={(e) => {
            setshowGraph(false);
            setGraphOption(e.target.value);
          }}
          value={graphOption}
        >
          <Radio value="bae">By Analysis period</Radio>
          <Radio value="bts">By Time-Series</Radio>
        </Radio.Group>
      </Modal>
      <Modal
        title="Export Map"
        open={printModalVisible}
        onOk={generateMapPDF}
        onCancel={() => setPrintModalVisible(false)}
        confirmLoading={printLoading}
        okText="Generate PDF"
        cancelText="Cancel"
        width={400}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <p style={{ marginBottom: "8px" }}>Title:</p>
            <Input
              value={printOptions.title}
              onChange={(e) =>
                setPrintOptions({ ...printOptions, title: e.target.value })
              }
              placeholder="Map Export"
            />
          </div>

          <div>
            <p style={{ marginBottom: "8px" }}>Paper Size:</p>
            <Radio.Group
              value={printOptions.paperSize}
              onChange={(e) =>
                setPrintOptions({ ...printOptions, paperSize: e.target.value })
              }
            >
              <Radio.Button value="a4">A4</Radio.Button>
              <Radio.Button value="letter">Letter</Radio.Button>
              <Radio.Button value="a3">A3</Radio.Button>
            </Radio.Group>
          </div>

          {/* <div>
            <p style={{ marginBottom: "8px" }}>Orientation:</p>
            <Radio.Group
              value={printOptions.orientation}
              onChange={(e) =>
                setPrintOptions({
                  ...printOptions,
                  orientation: e.target.value,
                })
              }
            >
              <Radio.Button value="portrait">Portrait</Radio.Button>
              <Radio.Button value="landscape">Landscape</Radio.Button>
            </Radio.Group>
          </div> */}

          <div>
            <p style={{ marginBottom: "8px" }}>Quality:</p>
            <Radio.Group
              value={printOptions.quality}
              onChange={(e) =>
                setPrintOptions({ ...printOptions, quality: e.target.value })
              }
            >
              <Radio.Button value="standard">Standard</Radio.Button>
              <Radio.Button value="high">High</Radio.Button>
            </Radio.Group>
          </div>

          <div>
            <Checkbox
              checked={printOptions.includeTimestamp}
              onChange={(e) =>
                setPrintOptions({
                  ...printOptions,
                  includeTimestamp: e.target.checked,
                })
              }
            >
              Include timestamp
            </Checkbox>
          </div>

          {/* <div>
            <Checkbox
              checked={printOptions.includeLegend}
              onChange={(e) =>
                setPrintOptions({
                  ...printOptions,
                  includeLegend: e.target.checked,
                })
              }
            >
              Include legend
            </Checkbox>
          </div> */}
        </Space>
      </Modal>
    </>
  );
}

export default MapWrapper;
