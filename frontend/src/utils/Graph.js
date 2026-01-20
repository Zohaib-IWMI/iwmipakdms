import Axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exporting from "highcharts/modules/exporting";
import exportData from "highcharts/modules/export-data";
import { setselectedKey } from "../slices/mapView";


exporting(Highcharts);
exportData(Highcharts);

function Graph(props) {
  const { loggedin } = useSelector((state) => state);
  const [data, setData] = useState(null);
  const {
    calcval,
    startmonth,
    endmonth,
    startyear,
    endyear,
    indicator,
    loading,
    error,
    calctype,
    selectedUnit,
    selectedDistrict,
    selectedTehsil,
    selectedMin,
    selectedMax,
    refresh,
    precipitation,
    months,
    drawnFeature,
    boundarySelect,
    fileName,
    graphOption,
  } = props;
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchMyAPI() {
      let unit, name;
      if (selectedTehsil) {
        unit = "tehsils";
        name = selectedTehsil;
      } else if (selectedDistrict) {
        unit = "districts";
        name = selectedDistrict;
      } else if (selectedUnit) {
        unit = "units";
        name = selectedUnit;
      }

      await Axios.post("../python/getdata", {
        params: {
          startmonth: startmonth,
          endmonth: endmonth,
          startyear: startyear,
          endyear: endyear,
          graphoption: graphOption,
          ...(drawnFeature
            ? { drawnFeature: JSON.stringify(drawnFeature[0].geometry) }
            : {}),
          unit: unit,
          name: name,
          ...(fileName ? { fileName: fileName } : {}),
          boundarySelect: boundarySelect,
          ...(indicator === "DrySpell" ? { precipitation: precipitation } : {}),
          ...(indicator === "DrySpell" ? {} : { aggr: calcval }),
          ...(indicator === "SPI_CHIRPS" || indicator === "SPI_ERA5L"
            ? { months: months }
            : {}),
          indice: indicator === "CWDI" ? "CWD" : indicator,
          calctype: calctype,
          min: selectedMin,
          max: selectedMax,
        },
      })
        .then(function (response) {
          if (response) {
            if (!response.data.data || response.data.data.trim() === "") {
              error("Data unavailable for selected analysis period");
              loading(false);
            } else if (response.data.data.indexOf("Error") !== -1) {
              error(response.data.data);
              loading(false);
            } else {
              // Check for errors only if we don't have valid data
              if (response.data.error && (!response.data.data || response.data.data.trim() === "")) {
                // Filter out survey-related errors
                const surveyKeywords = ['survey', 'feedback', 'satisfaction', 'qualtrics'];
                const containsSurvey = surveyKeywords.some(keyword =>
                  response.data.error.toLowerCase().includes(keyword.toLowerCase())
                );

                if (!containsSurvey) {
                  error(response.data.error);
                  loading(false);
                  return;
                }
              }

              setData(JSON.parse(response.data.data));
              loading(false);
            }
          }
        })
        .catch(function () {
        });
    }

    if (loggedin && indicator && refresh) {
      Axios.get("../backend/logincheck", {
        headers: {
          "access-token": localStorage.getItem("token"),
        },
      }).then((response) => {
        if (response.data.auth === true) {
          fetchMyAPI();
        } else dispatch(setselectedKey(null));
      });
    }
  }, [calcval, startmonth, endmonth, startyear, indicator, loggedin]);

  if (data) {
    const indices = [
      { CWD: "Climate Water Deficit" },
      { MAI: "Moisture Adequacy Index" },
      { NDVI: "Normalize Difference Vegetation Index" },
      { NDVI_Anamoly: "NDVI Anomalies" },
      { SMCI_FLDAS: "Soil Moisture Condition Index (FLDAS)" },
      { SMCI_SMAP: "Soil Moisture Condition Index (SMAP)" },
      { "SMCI (FLDAS)": "Soil Moisture Condition Index (FLDAS)" },
      { "SMCI (SMAP)": "Soil Moisture Condition Index (SMAP)" },
      { "SMCI_FLDAS": "Soil Moisture Condition Index (FLDAS)" },
      { "SMCI_SMAP": "Soil Moisture Condition Index (SMAP)" },
      { SMCI: "Soil Moisture Condition Index" },
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

    if (calcval === "default") {
    } else {
      if (!indicator) return;
      var dates = [],
        intervals = [];

      // Sort data by date before processing
      const sortedData = [...data.mapid].sort((a, b) => {
        const dateA = new Date(a[1]);
        const dateB = new Date(b[1]);
        return dateA - dateB;
      });

      sortedData.map((e) => {
        intervals.push(parseFloat(e[0].toFixed(2)));
        dates.push(e[1]);
        return null;
      });


      const found = indices.find((obj) => obj[indicator] !== undefined);
      try {
        const options = {
          chart: {
            zoomType: "xy",
          },
          title: {
            text: found[indicator],
          },
          yAxis: {
            title: {
              text: found[indicator],
            },
            min: indicator === "PCI" ? 0 : parseFloat(Math.min(...intervals) - 0.05),
            max: parseFloat(Math.max(...intervals) + 0.05),
            gridLineWidth: 1,
            labels: {
              formatter: function () {
                return this.value;
              },
            },
          },
          xAxis: {
            categories: dates,
            gridLineWidth: 1,
          },
          legend: {
            enabled: false,
          },
          series: [
            {
              name: indicator.toUpperCase(),
              type: "line",
              data: intervals,
              color: "#0000FF",
              marker: {
                fillColor: "#FF5733",
                lineWidth: 2,
                lineColor: "#FF5733",
              },
            },
          ],
          tooltip: {
            shared: true,
            useHTML: true,
            headerFormat: "<b>{point.key}</b><br/>",
            pointFormat:
              '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
            valueDecimals: 2,
          },
          exporting: {
            buttons: {
              contextButton: {
                menuItems: [
                  "printChart",
                  "separator",
                  "downloadPNG",
                  "downloadJPEG",
                  "downloadPDF",
                  "downloadSVG",
                  "separator",
                  "downloadCSV",
                  "downloadXLS",
                ],
              },
            },
          },
        };

        return <HighchartsReact highcharts={Highcharts} options={options} />;
      } catch (e) {}
    }
  } else {
    return "";
  }
}

export default Graph;
