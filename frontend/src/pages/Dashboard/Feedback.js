import CustomFooter from "../../components/Footer";
import CustomHeader from "../../components/Header";
import SubMenu from "../../components/SubMenu";
import { Layout, Space, Table, Typography, notification } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";
import { setLoggedIn, setadmin, setselectedKey } from "../../slices/mapView";

const { Header, Footer, Content } = Layout;
const { Title, Text } = Typography;

const headerStyle = {
  textAlign: "center",
  color: "#fff",
  background: "linear-gradient(180deg, #5C4033, #C4A484)",
  zIndex: 15000,
};
const contentStyle = {
  color: "#fff",
  background: "#fff",
  zIndex: 15000,
};
const footerStyle = {
  padding: 0,
  margin: 0,
  zIndex: 5000,
  backgroundColor: "#fff",
};

function FeedbackPage(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loggedin, admin, darkmode } = useSelector((state) => state);
  const [api, contextHolder] = notification.useNotification();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const page = tableParams.pagination.current;
      const pageSize = tableParams.pagination.pageSize;

      const response = await Axios.get(
        `../backend/feedbacks?page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            "access-token": localStorage.getItem("token"),
          },
        }
      );

      if (response?.data?.success) {
        setData(response.data.results || []);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: response.data.pagination?.total || 0,
          },
        });
      } else {
        api.error({
          message: "Failed to load feedback",
          description: response?.data?.message || "Please try again.",
          placement: "bottomRight",
        });
      }
    } catch (e) {
      api.error({
        message: "Not authorized",
        description: "Admin access required.",
        placement: "bottomRight",
      });
      dispatch(setselectedKey(null));
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(setLoggedIn(false));
      dispatch(setadmin(0));
      navigate("/login");
      return;
    }

    Axios.get("../backend/admincheck", {
      headers: {
        "access-token": token,
      },
    })
      .then((response) => {
        if (response?.data?.auth) {
          dispatch(setLoggedIn(true));
          dispatch(setadmin(response.data.admin));
          if (!(response.data.admin === 1 || response.data.admin === "1")) {
            navigate("/home");
          }
        } else {
          dispatch(setLoggedIn(false));
          dispatch(setadmin(0));
          navigate("/login");
        }
      })
      .catch(() => {
        dispatch(setLoggedIn(false));
        dispatch(setadmin(0));
        navigate("/login");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loggedin && (admin === 1 || admin === "1")) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tableParams), loggedin, admin]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 260,
    },
    {
      title: "Feedback",
      dataIndex: "feedback",
      key: "feedback",
      render: (text) => (
        <Text style={{ color: darkmode ? "white" : "#363636" }}>{text}</Text>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Layout style={{ minHeight: "100vh" }} breakpoint="sm">
        <Header style={headerStyle}>
          <CustomHeader heading={props.heading} />
        </Header>
        <Content style={contentStyle}>
          <SubMenu />
          <div className="container-layout container-fluid" style={{ padding: 0 }}>
            <div className="about-us-container" style={{ marginBottom: "100px" }}>
              <div className="row">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div className="row">
                    <div className="col-sm-12 col-lg-12">
                      <Title level={3} className="about-us">
                        Feedback
                      </Title>
                    </div>
                  </div>
                  <Table
                    columns={columns}
                    rowKey={(record) => record.id}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                  />
                </Space>
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

export default FeedbackPage;
