import { useDispatch, useSelector } from "react-redux";
import { Button, Menu, Modal, Form, Input, notification } from "antd";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setmodule, setselectedKey } from "../slices/mapView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressCard,
  faBook,
  faCircleExclamation,
  faCommentDots,
  faGauge,
  faHouseChimney,
  faSunPlantWilt,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";

import Axios from "axios";

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
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackWords, setFeedbackWords] = useState(0);
  const [feedbackForm] = Form.useForm();
  const [api, notificationContextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setcolor(darkmode ? "#fff" : "#000");
  }, [darkmode]);

  const countWords = (value) => {
    if (!value) return 0;
    return value
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  };

  const openFeedback = () => {
    setFeedbackOpen(true);
    dispatch(setselectedKey(null));
  };

  const closeFeedback = () => {
    setFeedbackOpen(false);
    setFeedbackSubmitting(false);
    setFeedbackWords(0);
    feedbackForm.resetFields();
  };

  const submitFeedback = async (values) => {
    try {
      setFeedbackSubmitting(true);
      const payload = {
        name: values.name?.trim(),
        email: values.email?.trim(),
        feedback: values.feedback?.trim(),
      };

      const response = await Axios.post("../backend/feedback", payload);
      if (response?.data?.success) {
        api.success({
          message: "Thank you!",
          description: "Your feedback has been submitted.",
          placement: "bottomRight",
        });
        closeFeedback();
      } else {
        api.error({
          message: "Submission failed",
          description:
            response?.data?.message || "Unable to submit feedback right now.",
          placement: "bottomRight",
        });
        setFeedbackSubmitting(false);
      }
    } catch (e) {
      api.error({
        message: "Submission failed",
        description: "Unable to submit feedback right now.",
        placement: "bottomRight",
      });
      setFeedbackSubmitting(false);
    }
  };

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
            label: (
              <Button
                href="#"
                style={{ textDecoration: "none" }}
                type="link"
                icon={<FontAwesomeIcon icon={faCommentDots} />}
                onClick={(e) => {
                  e.preventDefault();
                  openFeedback();
                }}
              >
                Feedback
              </Button>
            ),
            key: "feedback",
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
      {notificationContextHolder}

      <Modal
        title="Feedback"
        open={feedbackOpen}
        onCancel={closeFeedback}
        onOk={() => feedbackForm.submit()}
        okText={feedbackSubmitting ? "Submitting..." : "Submit"}
        confirmLoading={feedbackSubmitting}
        destroyOnClose
      >
        <Form
          form={feedbackForm}
          layout="vertical"
          onFinish={submitFeedback}
          onValuesChange={(changed) => {
            if (Object.prototype.hasOwnProperty.call(changed, "feedback")) {
              setFeedbackWords(countWords(changed.feedback));
            }
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Feedback</span>
                <span style={{ color: feedbackWords > 500 ? "#ff4d4f" : color }}>
                  Words: {feedbackWords}/500
                </span>
              </div>
            }
            name="feedback"
            rules={[
              { required: true, message: "Feedback is required" },
              {
                validator: async (_, value) => {
                  const words = countWords(value);
                  if (words === 0) {
                    throw new Error("Feedback is required");
                  }
                  if (words > 500) {
                    throw new Error("Feedback must be 500 words or less");
                  }
                },
              },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Enter your feedback (max 500 words)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
export default SubMenu;
