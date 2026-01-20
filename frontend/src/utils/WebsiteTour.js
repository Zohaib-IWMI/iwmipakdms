import { Tour } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setshowTour } from "../slices/mapView";

const WebsiteTour = ({ ref0, ref1, ref2, ref3, ref4, ref5, ref6, ref7 }) => {
  const dispatch = useDispatch();

  const { showTour, darkmode } = useSelector((state) => state);

  const steps = [
    {
      title: "PakDMS Map panel",
      description: "Click on polygon to select boundaries interactively",
      target: () => ref0.current,
    },
    {
      title: "Select Module",
      description: "Use this to switch between modules",
      target: () => ref4.current,
    },
    {
      title: "Select Boundary",
      description:
        "Select an administrative boundary from dropdown or by clicking on the map",
      target: () => ref5.current,
    },
    {
      title: "Select Indices",
      description:
        "Click to expand, select list of indices & read their information",
      target: () => ref6.current,
    },
    {
      title: "Select Start Date",
      description: "Use datepicker to select the start date for simulation",
      target: () => ref1.current,
    },
    {
      title: "Select End Date",
      description: "Use datepicker to select the end date for simulation",
      target: () => ref2.current,
    },
    {
      title: "Select Aggregation",
      description: "Use dropdown to select the aggregation parameter",
      target: () => ref3.current,
    },
    {
      title: "Actions",
      description: "Preview the layer for selected filters or view it's graph",
      target: () => ref7.current,
    },
  ];
  return (
    <Tour
      open={showTour}
      onClose={() => {
        // setopenTour(false);
        dispatch(setshowTour(false));
      }}
      // onFinish={dispatch(setshowTour(false))}
      // onChange={dispatch(setshowTour(false))}
      steps={steps}
      mask={{
        style: {
          boxShadow: "inset 0 0 15px #333",
        },
        color: darkmode ? "rgba(255, 255, 255, .5)" : "rgba(0, 0, 0, .5)",
      }}
    />
  );
};

export default WebsiteTour;
