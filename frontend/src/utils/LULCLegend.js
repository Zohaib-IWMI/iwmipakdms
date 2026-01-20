import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

const LULCLegend = ({ legendLULC }) => {
  const map = useMap();

  useEffect(() => {
    map.on("overlayadd", (e) => {
      if (e.name) legendLULC(true);
    });

    map.on("overlayremove", (e) => {
      if (e.name) legendLULC(false);
    });
  }, []);
  return (
    <div
      style={{
        background: "white",
        borderRadius: "5px",
        padding: "5px",
        zIndex: 5000,
        color: "black",
        width: "150px",
      }}
    >
      <span style={{ fontWeight: "bold", fontSize: "18px" }}>
        Sentinel-2 LULC
      </span>

      <div style={{ marginTop: "10px" }}>
        {[
          { color: "#1A5BAB", label: "Water" },
          { color: "#358221", label: "Trees" },
          { color: "#87D19E", label: "Flooded Veg" },
          { color: "#FFDB5C", label: "Crops" },
          { color: "#ED022A", label: "Built Area" },
          { color: "#EDE9E4", label: "Bare Ground" },
          { color: "#F2FAFF", label: "Ice/Snow" },
          { color: "#C8C8C8", label: "Clouds" },
          { color: "#C6AD8D", label: "Rangeland" },
        ].map(({ color, label }, index) => (
          <>
            <div
              key={index}
              style={{
                display: "inline-block",
                marginBottom: "5px",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "15px",
                  backgroundColor: color,
                  verticalAlign: "middle",
                }}
              ></div>
              <span
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  marginLeft: "10px",
                }}
              >
                {label}
              </span>
            </div>
            <br />
          </>
        ))}
      </div>
    </div>
  );
};

export default LULCLegend;
