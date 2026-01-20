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

function HeaderMap(props) {
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
        <a className="navbar-brand" href="home">
          <img
            className="sadams-iwmi-logo ml-auto"
            src="/images/PakDMS1.png"
            alt="IWMI LOGO"
          ></img>
          <span className="iwmi-title">{props.heading}</span>
        </a>
        <ul className="nav-header-right navbar-nav">
          <li className="nav-item">
            <Space direction="horizontal" size={"middle"}>
              {/* <DarkModeSwitch
                onChange={(e) => {
                  dispatch(setdarkmode(e));
                  setIsDarkMode(e);
                }}
                checked={isDarkMode}
                size={30}
              /> */}
              <div
                className="responsive-logos"
                style={{
                  padding: "0",
                }}
              >
                <img
                  className="sadams-ukaid-logo ml-auto"
                  src="https://vectorseek.com/wp-content/uploads/2023/09/Government-Of-Pakistan-Logo-Vector.svg-.png"
                  height={50}
                  alt="GoP"
                />
                <img
                  className="sadams-ukaid-logo ml-auto"
                  src="/images/government-of-punjab-logo.png"
                  height={50}
                  alt="GoP"
                />
                <img
                  className="sadams-ukaid-logo ml-auto"
                  src="/images/Pakistan_Met_Department.png"
                  height={50}
                  alt="PMD"
                />
                <img
                  className="sadams-ukaid-logo ml-auto"
                  src="/images/waporlogo.png"
                  height={50}
                  alt="wapor"
                />
                <img
                  className="sadams-ukaid-logo ml-auto"
                  src="/images/UKaid.png"
                  height={75}
                  alt="UKaid LOGO"
                />
                <img
                  className="sadams-ukaid-logo ml-auto"
                  src="/images/iwmi.png"
                  height={50}
                  alt="UKaid LOGO"
                />
              </div>
              <span
                style={{
                  fontWeight: "bold",
                }}
              >
                Beta Version
              </span>
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

export default HeaderMap;
