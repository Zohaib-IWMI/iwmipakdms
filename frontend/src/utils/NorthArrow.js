import React from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

function NorthArrow() {
  const map = useMap();

  React.useEffect(() => {
    const northArrowControl = L.control({ position: "topright" });

    northArrowControl.onAdd = function () {
      const div = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );
      div.innerHTML = `
          <img
            src="https://images.vexels.com/media/users/3/143561/isolated/preview/afa3aa927b63061e3b0222b7dab9cdbf-vintage-nautical-north-arrow-ubication.png"
            alt="North Arrow"
            style="width: 100px; height: 100px; transform: rotate(0deg); background-color: white; padding: 2px; border-radius: 5px;"
          />
        `;
      return div;
    };

    northArrowControl.addTo(map);

    return () => {
      northArrowControl.remove();
    };
  }, [map]);

  return null;
}

export default NorthArrow;
