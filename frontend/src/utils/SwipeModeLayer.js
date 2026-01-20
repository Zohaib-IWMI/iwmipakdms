import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../helpers/leaflet.swipemode";
import "../helpers/leaflet.swipemode.css";
import { useSelector } from "react-redux";

const SwipeModeLayer = ({ layers, leftLayerName, rightLayerName }) => {
  const { selectedTwo } = useSelector((state) => state);
  const map = useMap();

  useEffect(() => {
    // if (L.Control.swipeMode) {

    //   return;
    // }

    if (
      !layers ||
      !leftLayerName ||
      !rightLayerName ||
      layers === undefined ||
      layers.length < 2
    )
      return;
    if (!L.Control.swipeMode) {

      return;
    }

    // Define the left and right layers with the 'ext' option
    const leftLayer = L.tileLayer(layers[1].mapid, {
      name: leftLayerName,
    });

    const rightLayer = L.tileLayer(layers[0].mapid, {
      name: rightLayerName,
    });

    // Initialize SwipeMode control
    const swipeControl = L.Control.swipeMode(leftLayer, rightLayer).addTo(map);

    if (!selectedTwo) {
      swipeControl.toggle();
      return;
    }
    // Add layers to the map
    leftLayer.addTo(map);
    rightLayer.addTo(map);

    return () => {
      map.removeLayer(leftLayer);
      map.removeLayer(rightLayer);
      if (swipeControl) map.removeControl(swipeControl);
    };
  }, [map, layers, leftLayerName, rightLayerName, selectedTwo]);

  return null;
};

export default SwipeModeLayer;
