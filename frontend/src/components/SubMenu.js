import { useDispatch, useSelector } from "react-redux";
import { Button, Menu, Modal } from "antd";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setmodule, setselectedKey } from "../slices/mapView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressCard,
  faBook,
  faCircleExclamation,
  faGauge,
  faHouseChimney,
  faSunPlantWilt,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";

const config = {
  title: "Disclaimer",
  content: (
    <div>
      <p className="warning-text">
        Technical Integrity: Any changes or modifications to the application
        code may cause technical errors and alter its intended functions.
      </p>
      <p>
        Boundaries: IWMI has been following the guidelines of the UN on
        territorial boundaries for publications. The guidelines can be accessed
        here
      </p>
      <p>
        Data Sources: Most of the data used in this tool are based on satellite
        observations, which are not verified using field data. Therefore, some
        caution is recommended when using the tool.
      </p>
      <p>
        Data Availability: The functions of the tool depend on the availability
        of data from platforms like Google Earth Engine, NOAA, NASA, and others.
        Data is regularly updated in the PakDMS backend system, which may lead
        to possible delays.
      </p>
    </div>
  ),
  width: {
    xs: '90%',
    sm: '80%',
    md: '70%',
    lg: '60%',
    xl: '50%',
    xxl: '40%',
  },
};

function SubMenu() {
  const { darkmode, admin, loggedin, selectedKey } = useSelector(
    (state) => state
  );
  const [color, setcolor] = useState("#000");
  const [modal, contextHolder] = Modal.useModal({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setcolor(darkmode ? "#fff" : "#000");
  }, [darkmode]);

  return (
    <>
      <Menu
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
        }}
        mode="horizontal"
        selectedKeys={selectedKey}
        items={[
          {
            label: (
              <Button
                type="link"
                style={{ textDecoration: "none" }}
                href="/home"
                icon={<FontAwesomeIcon icon={faHouseChimney} />}
                onClick={() => dispatch(setselectedKey("home"))}
              >
                Home
              </Button>
            ),
            key: "home",
          },
          {
            label: (
              <Button
                type="link"
                style={{ textDecoration: "none" }}
                href="/map"
                onClick={() => {
                  navigate("");
                  dispatch(setmodule("monitoring"));
                  dispatch(setselectedKey("monitoring"));
                }}
                icon={<FontAwesomeIcon icon={faSunPlantWilt} />}
              >
                Drought Monitoring
              </Button>
            ),
            key: "monitoring",
          },
          // {
          //   label: (
          //     <Button
          //       type="link"
          //       href="/map"
          //       style={{ textDecoration: "none" }}
          //       onClick={() => {
          //         dispatch(setmodule("prediction"));
          //         dispatch(setselectedKey("prediction"));
          //       }}
          //       icon={<FontAwesomeIcon icon={faMagnifyingGlassChart} />}
          //     >
          //       Drought Prediction
          //     </Button>
          //   ),
          //   key: "prediction",
          // },
          {
            label: (
              <Button
                href="#"
                type="link"
                onClick={async () => {
                  modal.info(config);
                  dispatch(setselectedKey(null));
                }}
                icon={<FontAwesomeIcon icon={faCircleExclamation} />}
              >
                Disclaimer
              </Button>
            ),
            key: "disclaimer",
          },
          {
            ...(!loggedin
              ? {
                  label: (
                    <Button
                      href="/register"
                      style={{ textDecoration: "none" }}
                      type="link"
                      icon={<FontAwesomeIcon icon={faUserGear} />}
                    >
                      Register Now
                    </Button>
                  ),
                  key: "register",
                }
              : ""),
          },
          {
            label: (
              <Button
                href="/usermanual"
                style={{ textDecoration: "none" }}
                type="link"
                icon={<FontAwesomeIcon icon={faBook} />}
              >
                User Manual
              </Button>
            ),
            key: "usermanual",
          },
          {
            ...(loggedin && (admin === "1" || admin === 1)
              ? {
                  label: (
                    <Button
                      style={{ textDecoration: "none" }}
                      href="/dashboard"
                      type="link"
                      icon={<FontAwesomeIcon icon={faGauge} />}
                      onClick={() => dispatch(setselectedKey("dashboard"))}
                    >
                      Admin Panel
                    </Button>
                  ),
                  key: "dashboard",
                }
              : ""),
          },
          {
            label: (
              <Button
                type="link"
                style={{ textDecoration: "none" }}
                href="/contactus"
                icon={<FontAwesomeIcon icon={faAddressCard} />}
                onClick={() => dispatch(setselectedKey("about"))}
              >
                Contact Us
              </Button>
            ),
            key: "about",
          },
        ]}
      ></Menu>
      {contextHolder}
    </>
  );
}
export default SubMenu;
