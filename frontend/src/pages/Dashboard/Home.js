import React, { useEffect, useState } from "react";
import CustomHeader from "../../components/Header.js";
import CustomFooter from "../../components/Footer.js";
import "../../style/home.css";
import { Button, Carousel, Layout } from "antd";
import { useNavigate } from "react-router-dom";
import SubMenu from "../../components/SubMenu.js";
import { useDispatch, useSelector } from "react-redux";
import { setselectedKey } from "../../slices/mapView.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Axios from "axios";
import Marquee from "react-fast-marquee";

import {
  faCloud,
  faMagnifyingGlassChart,
  faSignIn,
  faSignOut,
  faSunPlantWilt,
  faTornado,
} from "@fortawesome/free-solid-svg-icons";
import zIndex from "@mui/material/styles/zIndex.js";
const { Header, Footer, Content } = Layout;

const headerStyle = {
  textAlign: "center",
  color: "#fff",
  background: "linear-gradient(180deg, #5C4033, #C4A484)",
  // zIndex: 5000,
};
const contentStyle = {
  color: "#fff",
  background: "#fff",
};
const footerStyle = {
  padding: 0,
  margin: 0,
  // color: "#fff",
  backgroundColor: "#fff",
  zIndex: 5000,
};

const cardStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
};

const Home = (props) => {
  const { darkmode } = useSelector((state) => state);
  const [isDarkMode, setIsDarkMode] = useState(() => darkmode);
  const [color, setcolor] = useState("#000");

  useEffect(() => {
    const handleContextmenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextmenu);
    return function cleanup() {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  useEffect(() => {
    setIsDarkMode(darkmode);
    setcolor(!darkmode ? "#fff" : "#000");
    document.documentElement.style.setProperty(
      "--ll-color",
      !darkmode ? "#000" : "#fff"
    );
    document.documentElement.style.setProperty(
      "--ll-background-color",
      darkmode ? "#000" : "#fff"
    );
  }, [darkmode]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <>
      <Layout>
        <Header style={headerStyle}>
          <CustomHeader heading={props.heading} />
        </Header>
        <Content style={contentStyle}>
          <SubMenu />
          <Carousel autoplay>
            <img
              src="images/Agri_Field_Pictures/1.jpg"
              height={300}
              alt="banner1"
            />
            <img
              src="images/Agri_Field_Pictures/5.jpg"
              height={300}
              alt="banner2"
            />
            <img
              src="images/Agri_Field_Pictures/3.jpg"
              height={300}
              alt="banner3"
            />
            <img
              src="images/Agri_Field_Pictures/4.jpg"
              height={300}
              alt="banner4"
            />
          </Carousel>
          <div
            id="content"
            className="container-fluid text-center"
            style={{ marginBottom: "75px" }}
          >
            <div className="no-gutters row-padding row">
              <center lg="12">
                <h2 className="about-us">
                  The Pakistan Drought Management System (PakDMS)
                </h2>
              </center>
              <div>
                <p className="select-text">
                  The Pakistan Drought Management System (PakDMS) leverages the
                  framework of the South Asia Drought Management System (SADMS)
                  developed by IWMI. This initiative marks a significant step
                  towards national drought preparedness, providing Pakistan with
                  a dedicated system tailored to its unique challenges. PakDMS
                  facilitates decision-makers, stakeholders, and communities
                  with timely and accurate drought information to enhance
                  drought preparedness, improve water resource management, and
                  reduce drought risks in the aftermath of climate change. This
                  portal is developed as part of the IWMI’s drought programme,
                  with the assistance of the Pakistan Meteorological Department,
                  to support various stakeholders in Pakistan.
                </p>
                <p className="select-text">
                  <b>Key Features:</b>{" "}
                </p>
                <p className="select-text">
                  <b>Drought Risk Mitigation</b>: The tool is specifically
                  designed for drought risk mitigation, enabling timely action
                  by government authorities and relevant development
                  organizations.{" "}
                </p>
                <p className="select-text">
                  <b>Sub-Modules</b>: It includes several sub-modules to
                  understand drought propagation and adaptation strategies, such
                  as
                  <ul>
                    <li>Drought Monitoring</li>
                    <li>Drought Forecasting</li>
                    <li>Drought Advisory</li>
                    <li>
                      Weather Forecast for better and timely drought management.
                    </li>
                  </ul>
                </p>
              </div>
              <div
                className="card-column col-3 col-sm-3 col-lg-3"
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="custom-card-x cb-2 cursor-ponter"
                  style={{ ...cardStyle, height: "auto" }}
                >
                  <div className="landing-page-card">
                    <FontAwesomeIcon
                      icon={faSunPlantWilt}
                      size="4x"
                      color={darkmode ? "white" : "black"}
                    />
                    <p className="icon-text">Drought Monitoring</p>
                    <p
                      className="icon-small-text"
                      style={{ color: darkmode ? "white" : "#363636" }}
                    >
                      To monitor current and past drought indices
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="card-column col-3 col-sm-3 col-lg-3"
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="custom-card-x cb-7 cursor-ponter"
                  style={{ ...cardStyle, height: "auto" }}
                >
                  <div className="landing-page-card">
                    <FontAwesomeIcon
                      icon={faMagnifyingGlassChart}
                      size="4x"
                      color={darkmode ? "white" : "black"}
                    />
                    <p className="icon-text">Drought Prediction</p>
                    <p
                      className="icon-small-text"
                      style={{ color: darkmode ? "white" : "#363636" }}
                    >
                      Likelihood, intensity, and duration of drought conditions
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="card-column col-3 col-sm-3 col-lg-3"
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="custom-card-x cb-2 cursor-ponter"
                  style={{ ...cardStyle, height: "auto" }}
                >
                  <div className="landing-page-card">
                    <FontAwesomeIcon
                      icon={faTornado}
                      size="4x"
                      color={darkmode ? "white" : "black"}
                    />
                    <p className="icon-text">Drought Advisory</p>
                    <p
                      className="icon-small-text"
                      style={{ color: darkmode ? "white" : "#363636" }}
                    >
                      Drought alerts based on pre-defined conditions
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="card-column col-3 col-sm-3 col-lg-3"
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="custom-card-x cb-7 cursor-ponter"
                  style={{ ...cardStyle, height: "auto" }}
                >
                  <div className="landing-page-card">
                    <FontAwesomeIcon
                      icon={faCloud}
                      size="4x"
                      color={darkmode ? "white" : "black"}
                    />
                    <p className="icon-text">Weather Forecasting</p>
                    <p
                      className="icon-small-text"
                      style={{ color: darkmode ? "white" : "#363636" }}
                    >
                      Predictions for temperature, precipitation, wind,
                      humidity etc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Marquee gradient={true} speed={60}>
              <img
                src="https://vectorseek.com/wp-content/uploads/2023/09/Government-Of-Pakistan-Logo-Vector.svg-.png"
                alt="logo1"
                style={{ margin: "0 30px", height: "75px", width: "75px" }}
              />
              <img
                src="images/government-of-punjab-logo.png"
                alt="logo2"
                style={{ margin: "0 30px", height: "75px", width: "90px" }}
              />
              <img
                src="images/Pakistan_Met_Department.png"
                alt="logo3"
                style={{ margin: "0 30px", height: "75px", width: "75px" }}
              />
              <img
                src="images/ndrmf.jpg"
                alt="logo4"
                style={{ margin: "0 30px", height: "75px", width: "75px" }}
              />
              <img
                src="https://www.cgiar.org/wp/wp-content/themes/cgiar/assets/images/logo@2x-0c19fb4ad3-0c19fb4ad3.png"
                alt="logo5"
                style={{ margin: "0 30px", height: "75px", width: "75px" }}
              />
              <img
                src="https://cdn.freelogovectors.net/wp-content/uploads/2018/08/FAO_logo-590x600.png"
                alt="logo5"
                style={{ margin: "0 30px", height: "75px", width: "75px" }}
              />
              <img
                src="images/UKaid.png"
                alt="logo5"
                style={{ margin: "0 30px", height: "125px", width: "200px" }}
              />
              <img
                src="images/waporlogo.png"
                alt="logo5"
                style={{ margin: "0 30px", height: "75px", width: "150px" }}
              />
            </Marquee>
          </div>
        </Content>
        <Footer style={footerStyle}>
          <CustomFooter />
        </Footer>
      </Layout>
    </>
  );
};

export default Home;
