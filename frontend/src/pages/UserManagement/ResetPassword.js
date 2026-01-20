import React from "react";
import Axios from "axios";
import "../../style/login.css";
import {
  Button,
  Form,
  Input,
  Layout,
  Space,
  Spin,
  notification,
} from "antd";
import CustomHeader from "../../components/Header";
import CustomFooter from "../../components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import KeepInTouch from "../../components/KeepInTouch";
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
  color: "#fff",
  zIndex: 5000,
  backgroundColor: "#7dbcea",
  background: "linear-gradient(180deg, #2a547c 0%, #224669 100%)",
};

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

function ResetPassword(props) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title, msg) => {
    api[type]({
      message: title,
      description: msg,
      style: { marginTop: "5em" },
    });
  };
  const [form] = Form.useForm();

  const onFinish = (values) => {
    setLoading(true);
    const { otp, password } = values;
    Axios.post("../backend/reset", {
      otp: otp,
      password: password,
      id: location.pathname.replace("/resetpassword/", ""),
    }).then((response) => {
      if (response.data.reset) {
        form.resetFields();
        setLoading(false);
        openNotificationWithIcon("info", "Information", response.data.msg);
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else {
        openNotificationWithIcon("error", "Error", response.data.msg);
        form.resetFields();
        setLoading(false);
      }
    });
  };

  const [meter, setMeter] = React.useState(false);
  const [password, setPassword] = React.useState("");

  const atLeastOneUppercase = /[A-Z]/g; // capital letters from A to Z
  const atLeastOneLowercase = /[a-z]/g; // small letters from a to z
  const atLeastOneNumeric = /[0-9]/g; // numbers from 0 to 9
  const atLeastOneSpecialChar = /[#?!@$%^&*-]/g; // any of the special characters within the square brackets
  const eightCharsOrMore = /.{8,}/g; // eight characters or more

  const passwordTracker = {
    uppercase: password.match(atLeastOneUppercase),
    lowercase: password.match(atLeastOneLowercase),
    number: password.match(atLeastOneNumeric),
    specialChar: password.match(atLeastOneSpecialChar),
    eightCharsOrGreater: password.match(eightCharsOrMore),
  };

  const passwordStrength = Object.values(passwordTracker).filter(
    (value) => value
  ).length;

  return (
    <>
      {contextHolder}
      <Layout style={{ minHeight: "100vh" }} breakpoint="sm">
        <Header style={headerStyle}>
          <CustomHeader heading={props.heading} />
        </Header>
        <Content style={contentStyle}>
          <SubMenu />
          <Spin spinning={loading}>
            {contextHolder}
            <div
              className="container-layout container-fluid"
              style={{ padding: 0 }}
            >
              <div className="about-us-container">
                <div className="login-card-wrapper">
                  <div className="card-shadow py-4 px-5 login-card">
                    <Title>Reset Password</Title>
                    <Form.Item>
                      Enter received OTP & new password to reset.
                    </Form.Item>
                    <Form
                      {...formItemLayout}
                      form={form}
                      name="ResetPassword"
                      onFinish={onFinish}
                      style={{
                        maxWidth: 600,
                      }}
                      scrollToFirstError
                    >
                      {/* <Form.Item name="id" label="id" hasFeedback>
                        <Input
                          defaultValue={location.pathname.replace(
                            "/resetpassword/",
                            ""
                          )}
                          value={location.pathname.replace(
                            "/resetpassword/",
                            ""
                          )}
                        />
                      </Form.Item> */}
                      <Form.Item
                        name="otp"
                        label="OTP"
                        rules={[
                          {
                            required: true,
                            message: "Please input received OTP!",
                          },
                        ]}
                        hasFeedback
                      >
                        <Input autoComplete="off" />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                          {
                            required: true,
                            message: "Please input your password!",
                          },
                        ]}
                        hasFeedback
                      >
                        <Input.Password
                          autoComplete="off"
                          onFocus={() => setMeter(true)}
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                        />
                      </Form.Item>
                      <Form.Item
                        name="strength"
                        label="Password Strength"
                        hasFeedback
                      >
                        <div className="password-strength-meter"></div>
                        <div>
                          {passwordStrength < 5 && "Must contain "}
                          {!passwordTracker.uppercase && "uppercase, "}
                          {!passwordTracker.lowercase && "lowercase, "}
                          {!passwordTracker.specialChar &&
                            "special character, "}
                          {!passwordTracker.number && "number, "}
                          {!passwordTracker.eightCharsOrGreater &&
                            "eight characters or more"}
                        </div>
                      </Form.Item>

                      <Form.Item
                        name="confirm"
                        label="Confirm Password"
                        dependencies={["password"]}
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: "Please confirm your password!",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue("password") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error(
                                  "The new password that you entered do not match!"
                                )
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password autoComplete="off" />
                      </Form.Item>

                      <Form.Item {...tailFormItemLayout}>
                        <Space direction="horizontal">
                          <Button type="primary" htmlType="submit">
                            Reset Password
                          </Button>
                          or <a href="/login">Sign-In now!</a>
                        </Space>
                      </Form.Item>
                    </Form>

                    <style>
                      {`
                        .password-strength-meter {
                          height: 0.3rem;
                          background-color: lightgrey;
                          border-radius: 3px;
                          margin: 0.5rem 0;
                        }

                        .password-strength-meter::before {
                          content: "";
                          background-color: ${[
                            "red",
                            "orange",
                            "#03a2cc",
                            "#03a2cc",
                            "#0ce052",
                          ][passwordStrength - 1] || ""};
                          height: 100%;
                          width: ${(passwordStrength / 5) * 100}%;
                          display: block;
                          border-radius: 3px;
                          transition: width 0.2s;
                        }
                      `}
                    </style>
                  </div>
                </div>
              </div>
            </div>
            <Footer footerline={props.heading} />
          </Spin>
          <KeepInTouch />
        </Content>
        <Footer style={footerStyle}>
          <CustomFooter />
        </Footer>
      </Layout>
    </>
  );
}

export default ResetPassword;
