import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { GeoJSON, useMap } from "react-leaflet";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import shp from "shpjs";
import L from "leaflet";
import axios from "axios";
import { setFileName } from "../slices/mapView";
import { useDispatch } from "react-redux";

const UploadShapefile = () => {
  const dispatch = useDispatch();
  const [geoJsonData, setGeoJsonData] = useState(null);
  const map = useMap(); // Access the map instance

  // Function to handle file upload to the backend
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "../backend/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Get the uploaded file name from the response
      const { fileName } = await response.data;
      //   message.success(`${fileName} uploaded successfully`);
      dispatch(setFileName(fileName));
      // Fetch the file from the server and process it using shp.js
      const fileUrl = `../backend/uploads/${fileName}`;
      const responseBlob = await fetch(fileUrl).then((res) =>
        res.arrayBuffer()
      );
      const geojson = await shp(responseBlob); // Parse shapefile as GeoJSON
      setGeoJsonData(geojson);

      // Fit the map to the GeoJSON layer's bounds after setting the data
      if (geojson.features && geojson.features.length > 0) {
        const geoJsonLayer = L.geoJSON(geojson); // Use Leaflet's native geoJSON layer
        map.fitBounds(geoJsonLayer.getBounds()); // Fit the map to the bounds of the geojson
      }
    } catch (error) {

      //   message.error(error);
    }

    // Prevent default upload behavior
    return false;
  };

  return (
    <>
      <Upload
        beforeUpload={handleFileUpload}
        accept=".zip"
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Shapefile (.zip)</Button>
      </Upload>
      {/* Optional: Add a button to clear the uploaded shapefile */}
      <Button
        icon={<DeleteOutlined />}
        onClick={() => {
          setGeoJsonData(null);
          map.eachLayer((layer) => {
            if (layer instanceof L.GeoJSON) {
              map.removeLayer(layer);
            }
          });
        }}
      >
        Clear
      </Button>

      {/* Render GeoJSON on the map if data exists */}
      {geoJsonData && <GeoJSON data={geoJsonData} />}
    </>
  );
};

export default UploadShapefile;
