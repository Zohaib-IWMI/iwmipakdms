import CustomFooter from "../../components/Footer";
import CustomHeader from "../../components/Header";
import SubMenu from "../../components/SubMenu";
import { Layout } from "antd";
import "../../style/home.css";
import "../../style/UserGuide.css";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import zIndex from "@mui/material/styles/zIndex";
const { Header, Footer, Content } = Layout;

const headerStyle = {
  textAlign: "center",
  background: "linear-gradient(180deg, #5C4033, #C4A484)",
  color: "#fff",
  zIndex: 5000,
};
const contentStyle = {
  color: "#fff",
  background: "#fff",
  zIndex: 15000,
};
const footerStyle = {
  padding: 0,
  margin: 0,
  // color: "#fff",
  backgroundColor: "#fff",
  zIndex: 5000,
};

function ContactUs(props) {
  const { darkmode } = useSelector((state) => state);
  return (
    <>
      <Layout style={{ minHeight: "100vh" }} breakpoint="sm">
        <Header style={headerStyle}>
          <CustomHeader heading={props.heading} />
        </Header>
        <Content style={contentStyle}>
          <SubMenu />
          <div
            className="container-layout container-fluid"
            style={{ padding: 0 }}
          >
            <div style={{ paddingTop: "unset" }}></div>
            <div className="user-guide-index-container about-us-position">
              <img
                alt="top-banner"
                src="images/Agri_Field_Pictures/TopBannerImage.jpg"
                className="top-index-image"
              />
            </div>
            <div className="about-us-container">
              <div className="row">
                <div className="col-sm-12 col-lg-6">
                  <div>
                    <p
                      className="about-us-main-content"
                      style={{ color: darkmode ? "white" : "#363636" }}
                    >
                      The Pakistan Drought Management System (PakDMS) leverages
                      the framework of South Asia Drought Management System
                      (SADMS). This initiative represents a significant step
                      towards national drought preparedness, providing Pakistan
                      with a dedicated system tailored to its unique challenges.
                      PakDMS empowers decision-makers, stakeholders, and
                      communities with timely and accurate drought information
                      to enhance water resource management and drought risk
                      reduction in the face of climate change.
                    </p>
                    <p
                      className="about-us-main-content"
                      style={{ color: darkmode ? "white" : "#363636" }}
                    >
                      This portal is developed as part of the International
                      Water Management Institute’s drought programme with the
                      assistance of Pakistan Meteorological Department to
                      support the various stakeholders in the Pakistan.
                    </p>
                    <p
                      className="about-us-main-content"
                      style={{ color: darkmode ? "white" : "#363636" }}
                    >
                      The tool is developed specifically for drought risk
                      mitigation and enables timely action to be taken by the
                      government authorities and relevant development
                      organizations. It has several sub-modules to understand
                      the drought propagations, conditions to adaptation
                      strategies, such as Weather Forecast, Drought Management
                      Tool, Contingency Plan, News feed, Online Bulletin, etc.
                      for better and timely drought management. Any changes or
                      modifications to the application code may cause technical
                      errors in the tool and would change its intended
                      functions. The majority of the data used in this tools are
                      based on satellite observations which are not verified
                      using field data. Therefore, some caution is recommended
                      when using the tool. The functions of the tools depend on
                      the availability of data in Google Earth Engine, NOAA,
                      NASA and other data providing platforms. Data are
                      regularly updated in the PakDMS backend system, and this
                      will lead to possible delays.
                    </p>
                  </div>
                </div>
                <div className="col-sm-12 col-lg-6">
                  <div className="image-container">
                    <img
                      alt="back-image"
                      className="back-image"
                      src="images/Agri_Field_Pictures/aboutUsBackImage.png"
                    />
                    <img
                      alt="front-image"
                      className="front-image"
                      style={{ height: "50%" }}
                      src="images/Agri_Field_Pictures/aboutUsImage.jpg"
                      
                    />
                    <p
                      className="about-us-main-content"
                      style={{ color: darkmode ? "white" : "#363636" }}
                    >
                      <b>Pakistan Office</b>
                      <p>
                        2KM Multan Road <br></br>Chowk Thokar Niaz Baig<br></br>
                        Lahore 53700, Pakistan
                      </p>{" "}
                      Tel: +92 4235299504, +92 4235299505, +92 4235299506{" "}
                      <br></br>Fax: +92 4235299508 <br></br>Email:
                      <a href="mailto:iwmi-pak@cgiar.org">iwmi-pak@cgiar.org</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="user-guide-index-container">
              <img
                src="images/Agri_Field_Pictures/BottomBannerImage.jpg"
                className="index-image"
              />
            </div>
          </div>
        </Content>
        <Footer style={footerStyle}>
          <CustomFooter />
        </Footer>
      </Layout>
    </>
  );
}

export default ContactUs;
