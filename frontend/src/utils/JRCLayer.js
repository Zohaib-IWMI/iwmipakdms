import Axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { Pane, TileLayer } from "react-leaflet";
import { useSelector } from "react-redux";

function JRCLayer(props) {
  const { loggedin } = useSelector((state) => state);
  const [data, setData] = useState([]);
  const { error } = props;

  useEffect(() => {
    async function fetchMyAPI() {
      try {
        const response = await Axios.post("../python/getboundary", {
          params: {
            unit: "National",
          },
        });

        console.log("JRC Response:", response.data);

        // Check if we have valid data first
        if (response.data.data && response.data.data.trim() !== "") {
          try {
            const { mapid } = JSON.parse(response.data.data);
            setData(mapid);
            console.log("JRC layer loaded successfully");
            // Successfully loaded data, don't show any errors
          } catch (parseError) {
            console.log("JRC parse error:", parseError);
            error("Error parsing JRC data from server");
          }
        } else {
          console.log("JRC no valid data, checking for errors");
          // Only show errors if we don't have valid data AND there's a meaningful error message
          if (response.data.error && response.data.error.trim() !== "") {
            // Filter out survey-related errors
            const surveyKeywords = ['survey', 'feedback', 'satisfaction', 'qualtrics'];
            const containsSurvey = surveyKeywords.some(keyword =>
              response.data.error.toLowerCase().includes(keyword.toLowerCase())
            );

            if (!containsSurvey) {
              console.log("JRC showing error:", response.data.error);
              error(response.data.error);
            } else {
              console.log("JRC filtered out survey error:", response.data.error);
            }
            // If it contains survey keywords, don't show any error
          } else {
            console.log("JRC no meaningful error to show");
          }
          // Removed the else clause that was showing "Data unavailable" when there's no error
        }
      } catch (err) {
        // Only show error for actual network/request failures
        if (err.response) {
          error("Failed to load JRC layer: Server error");
        } else if (err.request) {
          error("Failed to load JRC layer: Network error");
        } else {
          error("Failed to load JRC layer: " + err.message);
        }
      }
    }

    if (loggedin) {
      fetchMyAPI();
    }
  }, [loggedin, error]);

  if (data) {
    return (
      <Pane name="JRC" className="GridcellsPane">
        <TileLayer
          url={
            "https://earthengine.googleapis.com/v1alpha/" +
            data +
            "/tiles/{z}/{x}/{y}"
          }
        />
      </Pane>
    );
  } else {
    return "";
  }
}
export default JRCLayer;
