import React, { useRef } from "react";
import { FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

const DrawTools = ({
  resetAll,
  setDrawnFeature,
  drawnFeature,
  setloadlayer,
  setSelected,
  setSelectedWapor,
  setreset,
}) => {
  const map = useMap();
  const featureGroupRef = useRef(null);

  // Function to handle created shapes (drawn layers)
  const onCreated = (e) => {
    try {
      const layer = e.layer; // Get the newly created layer
      setDrawnFeature([...drawnFeature, layer.toGeoJSON()]);
      // Clear previous layers from the FeatureGroup (this only clears drawn features)
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
      }

      // Add the new layer to the feature group
      featureGroupRef.current.addLayer(layer);

      // Get the bounds of the newly added layer and zoom to fit
      if (layer.getBounds) {
        const bounds = layer.getBounds();
        map.fitBounds(bounds); // Zoom to the bounds of the drawn feature
      }
    } catch (error) {}
  };

  const onEdit = (e) => {
    try {
      // Get all edited layers
      const editedLayers = e.layers;
      
      // Create a new array to store updated features
      const updatedFeatures = [];
      
      // Convert each edited layer to GeoJSON and add to the updated features array
      editedLayers.eachLayer((layer) => {
        updatedFeatures.push(layer.toGeoJSON());
      });
      
      // Update the drawnFeature state with the edited features
      setDrawnFeature(updatedFeatures);
      
      // Call resetAll as before
      resetAll("edit");
    } catch (error) {

    }
  };

  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        position="topright"
        onCreated={onCreated}
        onEdited={onEdit}
        onDrawStart={() => {
          featureGroupRef.current.clearLayers();
          setloadlayer(false);
          setSelected(null);
          setSelectedWapor(null);
          setreset(true);
        }}
        onEditStart={() => {
          // You might want to do something when edit mode starts
        }}
        draw={{
          rectangle: true,
          polygon: true,
          polyline: false,
          circle: false,
          marker: true,
          circleMarker: false,
        }}
      />
    </FeatureGroup>
  );
};

export default DrawTools;