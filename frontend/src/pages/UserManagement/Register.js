import React, { useEffect } from "react";
import Axios from "axios";
import "../../style/login.css";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Layout,
  Row,
  Space,
  Spin,
  notification,
} from "antd";
import CustomHeader from "../../components/Header";
import CustomFooter from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SubMenu from "../../components/SubMenu";
import {
  loadCaptchaEnginge,
  LoadCanvasTemplateNoReload,
  validateCaptcha,
} from "react-simple-captcha";
import { Typography } from "antd";
import zIndex from "@mui/material/styles/zIndex";

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
  background: "#fff",
  marginBottom: "20rem",
  zIndex: 10000,
};
const footerStyle = {
  padding: 0,
  margin: 0,
  zIndex: 5000,
  // color: "#fff",
  backgroundColor: "#fff",
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

function Register(props) {
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

  useEffect(() => {
    loadCaptchaEnginge(6);
  }, [loading]);

  const onFinish = (values) => {
    setLoading(true);
    if (validateCaptcha(values.captcha) === true) {
      const { email, password, f_name, l_name, organization, purpose } = values;
      Axios.post("../backend/register", {
        email: email,
        password: password,
        f_name: f_name,
        l_name: l_name,
        organization: organization,
        purpose: purpose,
      }).then((response) => {
        if (
          (passwordTracker.eightCharsOrGreater &&
            passwordTracker.lowercase &&
            passwordTracker.number &&
            passwordTracker.specialChar &&
            passwordTracker.uppercase) == null
        ) {
          openNotificationWithIcon(
            "error",
            "Password Policy",
            "Password doesn't meet the required policy. Please address the errors"
          );
          setLoading(false);
        }
        if (response.data.reg) {
          form.resetFields();
          setLoading(false);
          openNotificationWithIcon(
            "success",
            "Sign Up Complete",
            response.data.message
          );
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        } else {
          openNotificationWithIcon(
            "error",
            "Error",
            "User already exists. Please login instead."
          );
          form.resetFields();
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
      openNotificationWithIcon(
        "error",
        "Invalid Captcha",
        "Please enter correct captcha to complete sign-up"
      );
    }
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
                  <div
                    className="card-shadow py-4 px-5 login-card"
                    style={{
                      width: "100%",
                      maxWidth: "1200px", // Limit maximum width
                      margin: "0 auto", // Center align the form
                      scroll: "auto",
                    }}
                  >
                    <Title>Sign Up</Title>
                    <Form
                      {...formItemLayout}
                      form={form}
                      name="register"
                      onFinish={onFinish}
                      scrollToFirstError
                    >
                      <Row gutter={16}>
                        {/* Column 1 */}
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="f_name"
                            label="First Name"
                            rules={[
                              {
                                required: true,
                                message: "Please input your First Name!",
                              },
                            ]}
                            hasFeedback
                          >
                            <Input autoComplete="off" />
                          </Form.Item>

                          <Form.Item
                            name="l_name"
                            label="Last Name"
                            rules={[
                              {
                                required: true,
                                message: "Please input your Last Name",
                              },
                            ]}
                            hasFeedback
                          >
                            <Input autoComplete="off" />
                          </Form.Item>

                          <Form.Item
                            name="email"
                            label="E-mail"
                            rules={[
                              {
                                type: "email",
                                message: "The input is not valid E-mail",
                              },
                              {
                                required: true,
                                message: "Please input your E-mail!",
                              },
                            ]}
                          >
                            <Input autoComplete="off" />
                          </Form.Item>

                          <Form.Item
                            name="organization"
                            label="Organization/Affiliation"
                            rules={[
                              {
                                required: false,
                                message: "Please type your organization",
                              },
                            ]}
                            hasFeedback
                          >
                            <Input autoComplete="off" />
                          </Form.Item>
                        </Col>

                        {/* Column 2 */}
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                              {
                                required: true,
                                message: "Please input your password",
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
                            name="confirm"
                            label="Confirm Password"
                            dependencies={["password"]}
                            hasFeedback
                            rules={[
                              {
                                required: true,
                                message: "Please confirm your password",
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

                          <Form.Item
                            name="purpose"
                            label="Purpose of Registration"
                            rules={[
                              {
                                required: false,
                                message:
                                  "Please type your purpose of registration",
                              },
                            ]}
                            hasFeedback
                          >
                            <Input autoComplete="off" />
                          </Form.Item>

                          <Form.Item
                            label="Captcha"
                            extra="We must make sure that your are a human."
                          >
                            <Row gutter={8}>
                              <Col span={12}>
                                <Form.Item
                                  name="captcha"
                                  noStyle
                                  rules={[
                                    {
                                      required: true,
                                      message: "Incorrect captcha!",
                                    },
                                  ]}
                                >
                                  <div>
                                    <LoadCanvasTemplateNoReload />
                                    <Input autoComplete="off" />
                                  </div>
                                </Form.Item>
                              </Col>
                            </Row>
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Full Width Items */}
                      <Form.Item
                        name="agreement"
                        valuePropName="checked"
                        rules={[
                          {
                            validator: (_, value) =>
                              value
                                ? Promise.resolve()
                                : Promise.reject(
                                    new Error(
                                      "Please accept terms & conditions"
                                    )
                                  ),
                          },
                        ]}
                        {...tailFormItemLayout}
                      >
                        <Checkbox>
                          I agree with{" "}
                          <a href="terms-conditions" target="_blank">
                            Terms & Conditions
                          </a>
                        </Checkbox>
                      </Form.Item>
                      <Form.Item {...tailFormItemLayout}>
                        <Space direction="horizontal">
                          <Button type="primary" htmlType="submit">
                            Register
                          </Button>
                          or <a href="login">Sign-In now!</a>
                        </Space>
                      </Form.Item>
                    </Form>

                    <style jsx>
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
        </Content>
        <Footer style={footerStyle}>
          <CustomFooter />
        </Footer>
      </Layout>
    </>
  );
}

export default Register;
