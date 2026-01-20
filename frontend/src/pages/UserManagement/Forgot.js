import React, { useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
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

function Forgot(props) {
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
    const { email } = values;
    Axios.post("../backend/forgot", {
      email: email,
    }).then((response) => {
      if (response.data.forgot) {
        form.resetFields();
        setLoading(false);
        openNotificationWithIcon("info", "Information", response.data.msg);
      } else {
        openNotificationWithIcon("error", "Error", response.data.msg);
        form.resetFields();
        setLoading(false);
      }
    });
  };

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
                    <Title>Forgot Password?</Title>
                    <Form.Item>
                      Enter your registered email address. An OTP will be sent
                      to it, which expires in 10 minutes.
                    </Form.Item>
                    <Form.Item>
                      Kindly use it to reset your password.
                    </Form.Item>
                    <Form
                      {...formItemLayout}
                      form={form}
                      name="forgot"
                      onFinish={onFinish}
                      style={{
                        maxWidth: 600,
                      }}
                      scrollToFirstError
                    >
                      <Form.Item
                        name="email"
                        label="E-mail"
                        rules={[
                          {
                            type: "email",
                            message: "The input is not valid E-mail!",
                          },
                          {
                            required: true,
                            message: "Please input your E-mail!",
                          },
                        ]}
                      >
                        <Input autoComplete="off" />
                      </Form.Item>
                      <Form.Item {...tailFormItemLayout}>
                        <Space direction="horizontal">
                          <Button type="primary" htmlType="submit">
                            Send Email
                          </Button>
                          or <a href="login">Sign-In now!</a>
                        </Space>
                      </Form.Item>
                    </Form>
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

export default Forgot;
