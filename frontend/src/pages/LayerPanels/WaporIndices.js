import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { List } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  faCircleQuestion,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { setSelected, setSelectedWapor } from "../../slices/mapView";

const WaporIndices = ({
  setloadlayer,
  setshowGraph,
  setshowOpacity,
  setshowprecipitation,
  setshowmonths,
  setapplyBtn,
  setgraphBtn,
  setlegend,
}) => {
  const dispatch = useDispatch();

  const {
    fileName,
    darkmode,
    selected,
    selectedWapor,
    showTour,
    center,
    zoom,
    module,
    admin1,
    admin1Name,
    admin2,
    admin2Name,
  } = useSelector((state) => state);

  const waporData = [
    {
      title: "AETI",
      disabeld: false,
      detail: "",
    },
    { title: "NPP", disabeld: false, detail: "" },
    { title: "WAPOR_Prec", disabeld: false, detail: "" },
    { title: "RRZSM", disabeld: false, detail: "" },
    { title: "RET", disabeld: false, detail: "" },
  ];

  const handleWaporIndice = (e) => {
    setloadlayer(false);
    setshowOpacity(false);
    setshowGraph(false);
    setshowprecipitation(false);
    setshowmonths(false);
    dispatch(setSelected(null));
    // minDate = dayjs("2018-01-01");
    if (e === selectedWapor) {
      setshowprecipitation(false);
      setshowmonths(false);
      setapplyBtn(false);
      setgraphBtn(false);
      setlegend(false);
      dispatch(setSelectedWapor(null));
    } else {
      setgraphBtn(true);
      setlegend(false);
      setapplyBtn(false);
      dispatch(setSelectedWapor(e));
    }
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={waporData}
      renderItem={(item, index) => (
        <>
          <List.Item
            style={{
              pointerEvents: item.disabled ? "none" : "",
              opacity: item.disabled ? 0.5 : 1,
              backgroundColor:
                selectedWapor === waporData[index].title
                  ? darkmode
                    ? "#111a2c"
                    : "#e6f4ff"
                  : "",
              color:
                selectedWapor === waporData[index].title
                  ? darkmode
                    ? "#1668dc"
                    : "#1668dc"
                  : null,
            }}
          >
            <div className="container">
              <div id="listItems">
                <div
                  className="column first-column"
                  onClick={() => handleWaporIndice(waporData[index].title)}
                >
                  {selectedWapor === waporData[index].title ? (
                    <FontAwesomeIcon icon={faEye} />
                  ) : (
                    <FontAwesomeIcon icon={faEyeSlash} />
                  )}
                </div>
                <div
                  className="column second-column"
                  onClick={() => handleWaporIndice(waporData[index].title)}
                >
                  {item.title}
                </div>
                <div className="column third-column">
                  {waporData[index].detail ? <></> : null}
                </div>
              </div>
            </div>
          </List.Item>
        </>
      )}
    />
  );
};

export default WaporIndices;
