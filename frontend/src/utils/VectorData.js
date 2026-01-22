import Axios from "axios";
import { useCallback, useEffect, useMemo, useState, useRef, memo } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { useSelector } from "react-redux";
import isEqual from "lodash/isEqual";

function VectorData(props) {
  const { darkmode } = useSelector((state) => state);
  const map = useMap();
  const prevFiltersRef = useRef();

  const {
    adminUnit,
    selectedUnit,
    selectedDistrict,
    selectedTehsil,
    getdistricts,
    gettehsils,
    layers,
    admin1,
    clickedUnit,
  } = props;

  // State for raw data
  const [rawData, setRawData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);

  // Proper hierarchical data filtering
  const filteredData = useMemo(() => {
    if (!adminUnit) return [];

    // For districts view - show all districts of selected unit
    if (adminUnit === "districts") {
      return rawData.filter(
        (feature) => !selectedUnit || feature.properties.unit === selectedUnit
      );
    }

    // For tehsils view - show all tehsils of selected district
    if (adminUnit === "tehsils") {
      return rawData.filter(
        (feature) =>
          !selectedDistrict || feature.properties.district === selectedDistrict
      );
    }

    // For subtehsil view - show specific tehsil
    if (adminUnit === "subtehsil") {
      return rawData.filter(
        (feature) =>
          feature.properties.district === selectedDistrict &&
          feature.properties.name === selectedTehsil
      );
    }

    return rawData;
  }, [rawData, adminUnit, selectedUnit, selectedDistrict, selectedTehsil]);

  // Style function
  const getStyle = useCallback(
    () => ({
      fillColor: "#b2b2b2",
      weight: 1.5,
      color: darkmode ? "yellow" : "black",
      dashArray: "3",
      fillOpacity: 0.2,
    }),
    [darkmode]
  );

  // Event handlers
  const handleclick = useCallback(
    (e) => {
      if (admin1 || layers.length > 0) return;

      const feature = e.target.feature;
      let level,
        unit = "";

      if (feature.id.includes("unit")) {
        level = 1;
        unit = feature.properties.name;
      } else if (feature.id.includes("district")) {
        level = 2;
        unit = feature.properties.unit;
      } else if (feature.id.includes("tehsil")) {
        level = 3;
        unit = feature.properties.district;
      }

      clickedUnit?.({
        level,
        unit,
        name: feature.properties.name,
        district: districts,
        tehsil: tehsils,
      });
    },
    [admin1, layers.length, clickedUnit, districts, tehsils]
  );

  const highlightFeature = useCallback(
    (e) => {
      const layer = e.target;
      layer.setStyle({
        weight: 2,
        dashArray: "3",
        fillOpacity: 0.1,
        fillColor: darkmode ? "yellow" : "black",
      });
      layer.bringToFront();
    },
    [darkmode]
  );

  const resetHighlight = useCallback(
    (e) => {
      const layer = e.target;
      layer.setStyle(getStyle());
    },
    [getStyle]
  );

  const eventHandlers = useMemo(
    () => ({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: handleclick,
    }),
    [highlightFeature, resetHighlight, handleclick]
  );

  // Data fetching
  // Data fetching effect - handles all hierarchy levels
  useEffect(() => {
    if (!adminUnit) return;
    const currentFilters = { adminUnit, selectedUnit, selectedDistrict };
    if (isEqual(currentFilters, prevFiltersRef.current)) return;
    prevFiltersRef.current = currentFilters;

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        let baseUrl = `../geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PakDMS:${adminUnit}&outputFormat=application/json`;

        // Build appropriate CQL filter based on hierarchy level
        if (adminUnit === "districts" && selectedUnit) {
          baseUrl += `&CQL_FILTER=unit='${selectedUnit}'`;
        } else if (adminUnit === "tehsils" && selectedDistrict) {
          baseUrl += `&CQL_FILTER=district='${selectedDistrict}'`;
        } else if (
          adminUnit === "subtehsil" &&
          selectedDistrict &&
          selectedTehsil
        ) {
          baseUrl = `../geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PakDMS:tehsils&outputFormat=application/json&CQL_FILTER=district='${selectedDistrict}' AND name='${selectedTehsil}'`;
        }

        const response = await Axios.get(baseUrl, {
          signal: controller.signal,
        });
        const features = response.data.features || [];

        setRawData(features);

        // Update available hierarchy levels
        if (adminUnit === "districts") {
          setDistricts(features);
          getdistricts?.(features);
        } else if (adminUnit === "tehsils") {
          setTehsils(features);
          gettehsils?.(features);
        }

        // Zoom to features if not in admin mode
        if (!admin1 && features.length > 0) {
          const bounds = L.geoJSON(features).getBounds();
          if (bounds.isValid()) {
            map.flyToBounds(bounds, { padding: [50, 50] });
          }
        }
      } catch (error) {
        if (!Axios.isCancel(error)) {

        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [
    adminUnit,
    selectedUnit,
    selectedDistrict,
    selectedTehsil,
    admin1,
    map,
    getdistricts,
    gettehsils,
  ]);

  // Feature event handling
  const onEachFeature = useCallback(
    (feature, layer) => {
      layer.on(eventHandlers);
      layer
        .bindTooltip(feature.properties.name, {
          permanent: false,
          direction: "center",
        })
        .openTooltip();
    },
    [eventHandlers]
  );

  if (!filteredData.length) return null;

  return (
    <GeoJSON
      key={`${adminUnit}-${selectedUnit}-${selectedDistrict}-${selectedTehsil}`}
      style={getStyle}
      data={filteredData}
      onEachFeature={onEachFeature}
    />
  );
}

export default memo(VectorData);
