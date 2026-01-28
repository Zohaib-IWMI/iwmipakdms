import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "./leaflet.mask.js";
import pakistan from "../pakistan.geojson";
import { useSelector } from "react-redux";
import Axios from "axios";

function AddMask({ selectedUnit, selectedDistrict, selectedTehsil, unit } = {}) {
  const { darkmode, admin1, admin1Name, admin2, admin2Name } = useSelector(
    (state) => state
  );
  const map = useMap();
  const layersRef = useRef([]);

  const zoomToLayer = useCallback(
    (asd) => {
      setTimeout(() => {
        map.flyToBounds(L.geoJSON(asd).getBounds());
      }, 10);
    },
    [map]
  );

  useEffect(() => {
    // remove previous layers if present
    if (layersRef.current.length) {
      layersRef.current.forEach((layer) => {
        try {
          map.removeLayer(layer);
        } catch (e) {}
      });
      layersRef.current = [];
    }

    const addLayer = (layer) => {
      layersRef.current.push(layer);
      return layer.addTo(map);
    };

    // Priority: explicit selection (selectedUnit/selectedDistrict/selectedTehsil)
    // falls back to user admin scope (admin1/admin2) and finally to full country geojson
    const doPakistanMask = () => {
      addLayer(
        L.mask(pakistan, {
          fillColor: darkmode ? "#000000" : "#FFFFFF",
          fillOpacity: 1,
        })
      );
    };

    const drawOutline = (features) => {
      addLayer(
        L.geoJSON(features, {
          style: {
            color: darkmode ? "#ffd400" : "#111111",
            weight: 2,
            opacity: 1,
            fillOpacity: 0,
          },
        })
      );
    };

    // Always keep outside-Pakistan blank
    doPakistanMask();

    // If explicit selection provided, request matching geometry from GeoServer
    if (selectedTehsil || selectedDistrict || selectedUnit) {
      let baseUrl =
        "../geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&outputFormat=application/json&typeName=PakDMS:";

      if (selectedTehsil) {
        baseUrl += "tehsils";
        baseUrl += `&CQL_FILTER=district='${selectedDistrict}' AND name='${selectedTehsil}'`;
      } else if (selectedDistrict) {
        baseUrl += "districts";
        baseUrl += `&CQL_FILTER=name='${selectedDistrict}'`;
      } else if (selectedUnit) {
        // for a province-level selection use the `units` layer (name is province)
        baseUrl += "units";
        baseUrl += `&CQL_FILTER=name='${selectedUnit}'`;
      }

      Axios.get(baseUrl)
        .then((resp) => {
          const features = resp.data.features || [];
          if (!features || features.length === 0) {
            return;
          }
          // For selections: show boundary outline + zoom (keep Pakistan mask too)
          drawOutline(features);
          zoomToLayer(features);
        })
        .catch(() => {});

      return () => {
        if (layersRef.current.length) {
          layersRef.current.forEach((layer) => {
            try {
              map.removeLayer(layer);
            } catch (e) {}
          });
          layersRef.current = [];
        }
      };
    }

    // If user-scoped admin flags exist, fetch those geometries
    if (admin1 || admin2) {
      let adminUnit = admin1 && !admin2 ? "units" : "districts";

      let baseUrl =
        "../geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PakDMS%3A" +
        adminUnit +
        "&outputFormat=application%2Fjson";
      if (admin1 && !admin2) baseUrl += "&CQL_FILTER=name='" + admin1Name + "'";
      if (admin2 && admin2) baseUrl += "&CQL_FILTER=name='" + admin2Name + "'";
      Axios.get(baseUrl).then((resp) => {
        const features = resp.data.features || [];
        if (!features || features.length === 0) {
          return;
        }
        // For admin-scoped restrictions: keep mask behavior
        addLayer(
          L.mask(features, {
            fillColor: darkmode ? "#000000" : "#FFFFFF",
            fillOpacity: 1,
          })
        );
        zoomToLayer(features);
      });

      return () => {
        if (layersRef.current.length) {
          layersRef.current.forEach((layer) => {
            try {
              map.removeLayer(layer);
            } catch (e) {}
          });
          layersRef.current = [];
        }
      };
    }

    // default: only the Pakistan mask
  }, [darkmode, selectedUnit, selectedDistrict, selectedTehsil, admin1, admin1Name, admin2, admin2Name, map, zoomToLayer]);

  return "";
}
export default AddMask;
