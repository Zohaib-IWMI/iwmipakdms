import { useNavigate } from "react-router-dom";
import "../style/header.css";
import { Button, Space, notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  clearResults,
  setLoggedIn,
  setadmin,
  setSelected,
  setselectedKey,
} from "../slices/mapView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faRightFromBracket,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

function Header(props) {
  const dispatch = useDispatch();
  const { loggedin, selected, admin } = useSelector((state) => state);
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title, msg, placement) => {
    api[type]({
      message: title,
      description: msg,
      placement,
    });
  };
  const navigate = useNavigate();
  const [loadings, setLoadings] = useState([]);
  const enterLoading = (index) => {
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });
    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
      logout();
    }, 1000);
  };

  const logout = () => {
    openNotificationWithIcon(
      "info",
      "Logging out..",
      "See ya soon!",
      "bottomRight"
    );
    setTimeout(() => {
      dispatch(setadmin(0));
      dispatch(setLoggedIn(false));
      dispatch(setSelected(null));
      dispatch(clearResults(true));
      dispatch(setselectedKey(null));
      localStorage.removeItem("token");
      navigate("/login");
    }, 1000);
  };

  return (
    <>
      {contextHolder}
      <nav className="navbar-header">
        <a
          href="https://www.iwmi.cgiar.org/"
          target="_blank"
          rel="noreferrer"
          className="navbar-brand"
        >
          <img
            className="sadams-iwmi-logo ml-auto"
            src="/images/iwmi.png"
            alt="IWMI LOGO"
          />
        </a>
        <div className="vl"></div>
        <a className="navbar-brand" href="home">
          <img
            className="sadams-iwmi-logo ml-auto"
            src="/images/PakDMS1.png"
            alt="IWMI LOGO"
          ></img>
          <span className="iwmi-title">{props.heading}</span>
        </a>
        <ul
          className="nav-header-right navbar-nav"
          style={{ marginRight: "10px" }}
        >
          <li className="nav-item">
            <Space direction="horizontal" size={"middle"}>
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Beta Version
              </span>
              {/* <DarkModeSwitch
                onChange={(e) => {
                  dispatch(setdarkmode(e));
                  setIsDarkMode(e);
                }}
                checked={isDarkMode}
                size={30}
              /> */}
              {loggedin && (admin === "1" || admin === 1) ? (
                <Button
                  href="/dashboard"
                  icon={<FontAwesomeIcon icon={faGauge} />}
                  onClick={() => dispatch(setselectedKey("dashboard"))}
                ></Button>
              ) : (
                ""
              )}
              {loggedin ? (
                <Button
                  icon={<FontAwesomeIcon icon={faRightToBracket} />}
                  loading={loadings[2]}
                  onClick={() => enterLoading(2)}
                />
              ) : (
                <Button
                  icon={<FontAwesomeIcon icon={faRightFromBracket} />}
                  loading={loadings[2]}
                  onClick={() => {
                    dispatch(setselectedKey(selected));
                    navigate("/login");
                  }}
                />
              )}
            </Space>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Header;
