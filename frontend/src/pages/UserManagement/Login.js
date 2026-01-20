import React, { useEffect } from "react";
import Axios from "axios";
import "../../style/login.css";
import { Button, Form, Input, Space, Spin, Layout, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import CustomHeader from "../../components/Header";
import CustomFooter from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import {
  clearResults,
  setLoggedIn,
  setadmin,
  setadmin1,
  setadmin1Name,
  setadmin2,
  setadmin2Name,
  setselectedKey,
} from "../../slices/mapView";
import { useDispatch, useSelector } from "react-redux";
import { setAuthToken } from "../../helpers/setAuthToken";
import { useState } from "react";
import SubMenu from "../../components/SubMenu";
import { Typography } from "antd";

const { Title } = Typography;

const { Header, Footer, Content } = Layout;

const headerStyle = {
  textAlign: "center",
  color: "#fff",
  background: "linear-gradient(180deg, #5C4033, #C4A484)",
  zIndex: 15000,
};
const contentStyle = {
  color: "#fff",
  background: "#fff"
};
const footerStyle = {
  padding: 0,
  margin: 0,
  zIndex: 5000,
  // color: "#fff",
  backgroundColor: "#fff",
};

function Login(props) {
  const { module } = useSelector((state) => state);
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title, msg, placement) => {
    api[type]({
      message: title,
      description: msg,
      placement,
    });
  };

  const [loading, setLoading] = useState(false);
  // const [loggedin, setloggedin] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    Axios.get("../backend/logincheck", {
      headers: {
        "access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      if (response.data.auth === true) {
        navigate("/map");
        dispatch(setLoggedIn(true));
      } else {
        dispatch(setselectedKey(null));
        dispatch(clearResults("reset"));
      }
    });
  }, [dispatch, navigate]);

  const onFinish = (values) => {
    Axios.post("../backend/login", {
      username: values.username,
      password: values.password,
    }).then((response) => {
      if (response.data.type === "error")
        openNotificationWithIcon(
          "error",
          "Error",
          response.data.message,
          "bottomRight"
        );
      setLoading(false);
      if (!response.data.auth) {
        dispatch(setLoggedIn(false));
      } else {
        setLoading(true);
        openNotificationWithIcon(
          "success",
          "Login Successful",
          "",
          "bottomRight"
        );
        localStorage.setItem("token", response.data.token);
        dispatch(setselectedKey(module));
        dispatch(setadmin(response.data.admin));
        setAuthToken(response.data.token);
        dispatch(setLoggedIn(true));
        dispatch(setadmin1(response.data.admin1));
        dispatch(setadmin1Name(response.data.admin1Name));
        dispatch(setadmin2(response.data.admin2));
        dispatch(setadmin2Name(response.data.admin2Name));
        setTimeout(() => {
          navigate("/map");
        }, 2000);
      }
    });
  };

  Axios.defaults.withCredentials = true;

  return (
    <>
      {contextHolder}
      <Layout style={{ minHeight: "100vh" }} breakpoint="sm">
        <Header style={headerStyle}>
          <CustomHeader heading={props.heading} />
        </Header>
        <Content style={contentStyle}>
          <SubMenu />
          <div className="about-us-container">
            <div className="login-card-wrapper">
              <div className="card-shadow py-4 px-5 login-card">
                <Title>Login</Title>
                <Spin spinning={loading}>
                  <Form
                    name="normal_login"
                    className="login-form"
                    onFinish={onFinish}
                  >
                    <Form.Item
                      name="username"
                      rules={[
                        {
                          required: true,
                          message: "Please input your Username!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<FontAwesomeIcon icon={faUser} size="1x" />}
                        placeholder="Username"
                        autoComplete="off"
                      />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: "Please input your Password!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<FontAwesomeIcon icon={faLock} size="1x" />}
                        type="password"
                        placeholder="Password"
                        autoComplete="off"
                      />
                    </Form.Item>
                    {/* <Form.Item>
                      <Space direction="horizontal">
                        <a className="login-form-forgot" href="forgotpassword">
                          Forgot password
                        </a>
                      </Space>
                    </Form.Item> */}
                    <Form.Item>
                      <Space direction="vertical">
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="login-form-button"
                        >
                          Log in
                        </Button>
                        <a href="register">Register now!</a>
                        <a href="forgot">Forgot your password?</a>
                      </Space>
                    </Form.Item>
                  </Form>
                </Spin>
              </div>
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

export default Login;
