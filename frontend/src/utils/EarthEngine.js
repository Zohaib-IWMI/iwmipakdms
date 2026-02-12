import Axios from "axios";
import { useEffect, useState, useRef } from "react";
import { TileLayer } from "react-leaflet";
import { useSelector } from "react-redux";

function EarthEngine(props) {
  const { loggedin } = useSelector((state) => state);
  const [data, setData] = useState(null);
  const cancelTokenRef = useRef(null);
  const requestIdRef = useRef(null);

  const {
    calcval,
    startmonth,
    endmonth,
    startyear,
    endyear,
    indicator,
    indicatorTwo,
    loading,
    error,
    res,
    calctype,
    selectedUnit,
    selectedDistrict,
    selectedTehsil,
    selectedMin,
    selectedMax,
    refresh,
    precipitation,
    months,
    compare,
    opac,
    drawnFeature,
    boundarySelect,
    fileName,
    onCancelRequest,
    setCancelFunction,
  } = props;

  // Cancel the current request
  const cancelRequest = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("Operation canceled by the user");

      // Only notify server for user-initiated cancellations
      if (requestIdRef.current) {
        Axios.post("../python/cancelDataRequest", {
          requestId: requestIdRef.current,
        }).catch((err) => {
          // Error handling for cancel request
        });
      }

      loading(false);
      if (onCancelRequest) onCancelRequest();
    }
  };

  // Set up the cancel function reference properly
  useEffect(() => {
    if (setCancelFunction) {
      setCancelFunction(() => cancelRequest);
    }

    return () => {
      if (setCancelFunction) {
        setCancelFunction(null);
      }
    };
  }, [setCancelFunction]);

  useEffect(() => {
    if (!loggedin || !refresh || !(indicator || indicatorTwo)) {
      return; // Don't make the request unless these conditions are met
    }


    let isMounted = true;

    async function fetchMyAPI() {
      // Cancel any ongoing request on the client side only
      if (cancelTokenRef.current) {

        cancelTokenRef.current.cancel("New request initiated");
      }

      // Create a new cancel token and request ID
      cancelTokenRef.current = Axios.CancelToken.source();
      requestIdRef.current = Date.now().toString();

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

      try {

        const response = await Axios.post(
          "../python/getdata",
          {
            params: {
              startmonth: startmonth,
              endmonth: endmonth,
              startyear: startyear,
              endyear: endyear,
              ...(drawnFeature && drawnFeature.length > 0
                ? { drawnFeature: JSON.stringify(drawnFeature[0].geometry) }
                : {}),
              unit: unit,
              name: name,
              ...(fileName ? { fileName: fileName } : {}),
              boundarySelect: boundarySelect,
              ...(indicator === "DrySpell"
                ? { precipitation: precipitation }
                : {}),
              ...(indicator === "DrySpell" ? {} : { aggr: calcval }),
              ...(indicator === "SPI_CHIRPS" ||
              indicator === "SPI_ERA5L" ||
              indicator === "RDI_WAPOR" ||
              indicatorTwo === "SPI_CHIRPS" ||
              indicatorTwo === "SPI_ERA5L" ||
              indicatorTwo === "RDI_WAPOR"
                ? { months: months }
                : {}),
              indice: !compare
                ? indicator === "CWDI"
                  ? "CWD"
                  : indicator
                : indicatorTwo === "CWDI"
                ? "CWD"
                : indicatorTwo,
              calctype: calctype,
              min: selectedMin,
              max: selectedMax,
            },
          },
          {
            cancelToken: cancelTokenRef.current.token,
          }
        );



        // Check if component is still mounted before updating state
        if (!isMounted) {

          return;
        }

        // If the server returned an error message, surface it first
        if (response && response.data && response.data.error) {
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

        // Now check if we have data and it's not empty
        if (response && response.data) {
          if (!response.data.data || response.data.data.trim() === "") {
            error("Data unavailable for selected analysis period");
            loading(false);
            return;
          }

          // Check if the response contains "Error"
          if (response.data.data.indexOf("Error") !== -1) {
            error(response.data.data);
            loading(false);
            return;
          }

          try {
            const jsonData = JSON.parse(response.data.data);
            const { mapid } = jsonData;
            res(jsonData);
            setData(mapid);
            if (props.onProgressUpdate) props.onProgressUpdate(100);
            loading(false);
          } catch (jsonError) {
            error("Error parsing data from server: " + jsonError.message);
            loading(false);
          }

          return () => {
            if (props.onProgressUpdate && isMounted) {
              props.onProgressUpdate(0);
            }
          };
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (Axios.isCancel(err)) {
          // Request was cancelled
        } else {
          error(
            "An error occurred while fetching data: " +
              (err.message || "Unknown error")
          );
          loading(false);
        }
        if (props.onProgressUpdate && isMounted) {
          props.onProgressUpdate(0);
        }
      }
    }

    fetchMyAPI();

    // Cleanup function to cancel any ongoing request when dependencies change or component unmounts
    return () => {
      isMounted = false;
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel(
          "Dependencies changed or component unmounted"
        );
      }
    };
  }, [
    calcval,
    startmonth,
    endmonth,
    startyear,
    indicator,
    indicatorTwo,
    loggedin,
    boundarySelect,
    calctype,
    compare,
    drawnFeature,
    error,
    fileName,
    loading,
    months,
    precipitation,
    refresh,
    res,
    selectedDistrict,
    selectedMax,
    selectedMin,
    selectedTehsil,
    selectedUnit,
  ]);

  if (data) {
    return (
      <TileLayer
        key={data}
        url={data}
        opacity={opac}
        maxZoom={27}
        zIndex={1000}
      />
    );
  } else {
    return null;
  }
}

export default EarthEngine;
