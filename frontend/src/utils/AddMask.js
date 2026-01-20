import { useCallback, useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "./leaflet.mask.js";
import pakistan from "../pakistan.geojson";
import { useSelector } from "react-redux";
import Axios from "axios";

function AddMask() {
  const { darkmode, admin1, admin1Name, admin2, admin2Name } = useSelector(
    (state) => state
  );
  const map = useMap();

  const zoomToLayer = useCallback(
    (asd) => {
      setTimeout(() => {
        map.flyToBounds(L.geoJSON(asd).getBounds());
      }, 10);
    },
    [map]
  );

  useEffect(() => {
    if (!admin1 && !admin2)
      L.mask(pakistan, {
        fillColor: darkmode ? "#000000" : "#FFFFFF",
        fillOpacity: 1,
      }).addTo(map);
    else {
      let adminUnit = admin1 && !admin2 ? "units" : "districts";

      let baseUrl =
        "../geoserver/PakDMS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PakDMS%3A" +
        adminUnit +
        "&outputFormat=application%2Fjson";
      if (admin1 && !admin2) baseUrl += "&CQL_FILTER=name='" + admin1Name + "'";
      if (admin2 && admin2) baseUrl += "&CQL_FILTER=name='" + admin2Name + "'";
      Axios.get(baseUrl).then((resp) => {
        L.mask(resp.data.features, {
          fillColor: darkmode ? "#000000" : "#FFFFFF",
          fillOpacity: 1,
        }).addTo(map);
        zoomToLayer(resp.data.features);
      });
    }
  }, [darkmode]);

  return "";
}
export default AddMask;
