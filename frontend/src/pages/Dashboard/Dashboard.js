import CustomFooter from "../../components/Footer";
import CustomHeader from "../../components/Header";
import SubMenu from "../../components/SubMenu";
import GaugeChart from "react-gauge-chart";

import {
  Avatar,
  Button,
  Input,
  Layout,
  Popconfirm,
  Select,
  Skeleton,
  Space,
  Switch,
  notification,
} from "antd";
import "../../style/home.css";
import "../../style/UserGuide.css";
import KeepInTouch from "../../components/KeepInTouch";
import React, { useEffect, useRef, useState } from "react";
import { Table } from "antd";
import Axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLoggedIn, setselectedKey } from "../../slices/mapView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClose,
  faRemove,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Highlighter from "react-highlight-words";
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
  zIndex: 10000,
};
const footerStyle = {
  padding: 0,
  margin: 0,
  zIndex: 5000,
  color: "#fff",
  backgroundColor: "#7dbcea",
  background: "linear-gradient(180deg, #2a547c 0%, #224669 100%)",
};

function Dashboard(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkmode, loggedin } = useSelector((state) => state);
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title, msg, placement) => {
    api[type]({
      message: title,
      description: msg,
      placement,
    });
  };

  const [reload, setreload] = useState(false);
  const [showUnit, setshowUnit] = useState(false);
  const [showDistrict, setshowDistrict] = useState(false);
  const [data, setData] = useState([]);
  const [districts, setdistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const fetchData = () => {
    setLoading(true);
    fetch(`../backend/getAllUsers`)
      .then((res) => res.json())
      .then(({ results }) => {
        setData(results);
        setLoading(false);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: results.length ? results.length : 0,
          },
        });
      });
  };
  useEffect(() => {
    Axios.get("../backend/logincheck", {
      headers: {
        "access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      if (response.data.auth === true) {
        fetchData();
      } else {
        dispatch(setselectedKey(null));
        dispatch(setLoggedIn(false));
        setLoading(true);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    });
  }, [JSON.stringify(tableParams), reload]);
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const handleChange = (e, key, cat) => {
    setLoading(true);
    const val = e === true || e === false ? (e ? "1" : "0") : e;
    const newData = data.map((item) => {
      if (item.uuid === key) {
        switch (cat) {
          case cat === "admin":
            item = { ...item, admin: val };
            break;
          case cat === "isApproved":
            item = { ...item, isApproved: val };
            break;
          case cat === "remove":
            item = { ...item, remove: val };
            break;
          case cat === "admin1":
            item = { ...item, admin1: val };
            break;
          case cat === "admin1Name":
            item = { ...item, admin1Name: val };
            break;
          case cat === "admin2":
            item = { ...item, admin2: val };
            break;
          case cat === "admin2Name":
            item = { ...item, admin2Name: val };
            break;
        }
        // return cat === "admin"
        //   ? { ...item, admin: val }
        //   : { ...item, isApproved: val };
      }
      return item;
    });

    // For approval actions, show a different message
    if (cat === "isApproved" && val === "1") {
      openNotificationWithIcon(
        "info",
        "Processing",
        "Approving user and sending notification email...",
        "bottomRight"
      );
    }

    updateDatabase(key, val, cat);
    setData(newData);
    setreload(true);
  };

  const updateDatabase = async (rowKey, selectedValue, cat) => {
    try {
      const response = await fetch("../backend/updateUserDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: rowKey, selectedValue, cat }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      data.update
        ? openNotificationWithIcon(
            "success",
            "Success",
            data.message,
            "bottomRight"
          )
        : openNotificationWithIcon(
            "error",
            "Error",
            data.message,
            "bottomRight"
          );
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
    setreload(true);
  };

  const fetchDistricts = async (unit) => {
    try {
      Axios.get(
        "../geoserver/PakDMS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PakDMS%3Adistricts&outputFormat=application%2Fjson&CQL_FILTER=unit='" +
          unit +
          "'"
      ).then((resp) => {
        const fetchOnlyProperties = resp.data.features.map(
          (item) => item.properties
        );
        // const fetchOnlyDistrictNames = fetchOnlyProperties.map((x) => x.name);

        const fetchOnlyDistrictNames = fetchOnlyProperties.map((district) => ({
          value: district.name,
          label: district.name,
        }));
        setdistricts(
          fetchOnlyDistrictNames.sort((a, b) => a.value.localeCompare(b.value))
        );
      });
    } catch (error) {
      setLoading(false);
    }
    setreload(true);
  };

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search...`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<FontAwesomeIcon icon={faSearch} />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <FontAwesomeIcon icon={faSearch} />
      // <SearchOutlined
      //   style={{
      //     color: filtered ? "#1677ff" : undefined,
      //   }}
      // />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "",
      align: "center",
      width: "5%",
      render: () => {
        return <Avatar icon={<FontAwesomeIcon icon={faUser} />} />;
      },
    },
    {
      title: "First Name",
      dataIndex: "f_name",
      key: "f_name",
      width: "10%",
      ...getColumnSearchProps("f_name"),
    },
    {
      title: "Last Name",
      dataIndex: "l_name",
      key: "l_name",
      width: "10%",
      ...getColumnSearchProps("l_name"),
    },
    {
      title: "Email",
      dataIndex: "username",
      key: "username",
      width: "5%",
      ...getColumnSearchProps("username"),
    },
    {
      title: "Unit?",
      dataIndex: "admin1",
      key: "admin1",
      width: "5%",
      render: (_, record) => (
        <Switch
          checkedChildren={<FontAwesomeIcon icon={faCheck} />}
          unCheckedChildren={<FontAwesomeIcon icon={faClose} />}
          defaultChecked={record.admin1}
          onChange={(e) => {
            if (e) {
              setshowUnit(true);
              openNotificationWithIcon(
                "info",
                "Information",
                "Select the unit name to save changes permanently",
                "bottomRight"
              );
            } else {
              setshowUnit(false);
              handleChange(e, record.uuid, "admin1");
              handleChange("", record.uuid, "admin1Name");
              handleChange(0, record.uuid, "admin2");
              handleChange("", record.uuid, "admin2Name");
            }
          }}
          // onChange={(e) => handleChange(e, record.uuid, "admin1")}
        />
      ),
    },
    {
      title: "Selected Unit",
      dataIndex: "admin1Name",
      key: "admin1Name",
      render: (_, record) =>
        showUnit || record.admin1 ? (
          <Select
            defaultValue={[record.admin1Name]}
            onChange={(e) => {
              handleChange(e, record.uuid, "admin1Name");
            }}
            style={{
              width: "100%",
            }}
            options={[
              {
                value: "AZAD KASHMIR",
                label: "AJK",
              },
              {
                value: "BALOCHISTAN",
                label: "BALOCHISTAN",
              },
              {
                value: "GILGIT BALTISTAN",
                label: "GB",
              },
              {
                value: "FEDERAL CAPITAL TERRITORY",
                label: "ISLAMABAD",
              },
              {
                value: "KHYBER PAKHTUNKHWA",
                label: "KPK",
              },
              {
                value: "PUNJAB",
                label: "PUNJAB",
              },
              {
                value: "SINDH",
                label: "SINDH",
              },
            ]}
          />
        ) : null,
    },
    {
      title: "District",
      width: "5%",
      dataIndex: "admin2",
      key: "admin2",
      render: (_, record) =>
        record.admin1Name ? (
          <Switch
            checkedChildren={<FontAwesomeIcon icon={faCheck} />}
            unCheckedChildren={<FontAwesomeIcon icon={faClose} />}
            defaultChecked={record.admin2}
            onChange={(e) => {
              if (e) {
                setshowDistrict(true);
                fetchDistricts(record.admin1Name);
                openNotificationWithIcon(
                  "info",
                  "Information",
                  "Select the district name to save changes permanently",
                  "bottomRight"
                );
              } else {
                setshowDistrict(false);
                handleChange(e, record.uuid, "admin2");
                handleChange("", record.uuid, "admin2Name");
              }
            }}
            // onChange={(e) => handleChange(e, record.uuid, "admin2")}
          />
        ) : null,
    },
    {
      title: "Selected District",
      dataIndex: "admin2Name",
      key: "admin2Name",
      render: (_, record) =>
        showDistrict || record.admin2 ? (
          <Select
            defaultValue={[record.admin2Name]}
            options={districts}
            onChange={(e) => {
              handleChange(e, record.uuid, "admin2Name");
            }}
            style={{
              width: "100%",
            }}
          />
        ) : null,
    },
    {
      title: "Approved",
      dataIndex: "isApproved",
      key: "isApproved",
      render: (_, record) => (
        <Switch
          checkedChildren={<FontAwesomeIcon icon={faCheck} />}
          unCheckedChildren={<FontAwesomeIcon icon={faClose} />}
          defaultChecked={record.isApproved}
          onChange={(e) => handleChange(e, record.uuid, "isApproved")}
        />
      ),
    },
    {
      title: "Admin?",
      dataIndex: "admin",
      key: "admin",
      render: (_, record) => (
        <Switch
          checkedChildren={<FontAwesomeIcon icon={faCheck} />}
          unCheckedChildren={<FontAwesomeIcon icon={faClose} />}
          defaultChecked={record.admin}
          onChange={(e) => handleChange(e, record.uuid, "admin")}
        />
      ),
    },
    {
      title: "Organizatiaon",
      dataIndex: "organization",
      key: "organization",
      width: "5%",
    },
    {
      title: "Purpose",
      dataIndex: "purpose",
      key: "purpose",
      width: "5%",
    },
    {
      title: "Remove",
      align: "center",
      width: "5%",
      render: (_, record) => {
        return (
          <FontAwesomeIcon
            style={{ cursor: "pointer", color: "red" }}
            icon={faRemove}
            onClick={(e) => {
              e.stopPropagation();
              if (
                window.confirm("Are you sure you want to delete this user?")
              ) {
                handleChange("1", record.uuid, "remove");
              } else {
                openNotificationWithIcon(
                  "info",
                  "Information",
                  "Action canceled by administrator",
                  "bottomRight"
                );
              }
            }}
          />
        );
      },
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
          {!loggedin ? <Skeleton active /> : ""}
          <div
            className="container-layout container-fluid"
            style={{ padding: 0 }}
          >
            <div style={{ paddingTop: "unset" }}></div>
            <div
              className="about-us-container"
              style={{ marginBottom: "100px" }}
            >
              <div className="row">
                <Space direction="vertical">
                  <div className="row">
                    <div className="col-sm-12 col-lg-6">
                      <div>
                        <h3 className="about-us">User Access Management</h3>
                      </div>
                    </div>
                    <div className="col-sm-12 col-lg-6">
                      <div className="image-container">
                        {data ? (
                          <center>
                            <GaugeChart
                              nrOfLevels={20}
                              style={{ width: "200px" }}
                              textColor={darkmode ? "white" : "black"}
                              id="gauge-chart1"
                              colors={["#5BE12C", "#F5CD19", "#EA4228"]}
                              percent={data.length / 100}
                              formatTextValue={(e) =>
                                e === 1 ? e + " User" : e + " Users"
                              }
                            />
                          </center>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                  <Table
                    columns={columns}
                    rowKey={(record) => record.uuid}
                    dataSource={data}
                    pagination={tableParams.pagination}
                    loading={loading}
                    onChange={handleTableChange}
                  >
                    {/* <Column
                      title="Avatar"
                      align="center"
                      render={() => (
                        <Avatar
                          style={{}}
                          icon={<FontAwesomeIcon icon={faUser} />}
                        />
                      )}
                    ></Column>
                    <ColumnGroup title="Full Name">
                      <Column
                        title="First Name"
                        dataIndex="f_name"
                        key="f_name"
                        align="center"
                      />
                      <Column
                        title="Last Name"
                        dataIndex="l_name"
                        key="l_name"
                        align="center"
                      />
                    </ColumnGroup>
                    <Column
                      title="Username / Email"
                      dataIndex="username"
                      key="username"
                      align="center"
                    />
                    <Column
                      title="Approved?"
                      key="isApproved"
                      align="center"
                      render={(_, record) => (
                        <Switch
                          checkedChildren={<FontAwesomeIcon icon={faCheck} />}
                          unCheckedChildren={<FontAwesomeIcon icon={faClose} />}
                          defaultChecked={record.isApproved}
                          onChange={(e) =>
                            handleChange(e, record.uuid, "isApproved")
                          }
                        />
                      )}
                    />
                    <Column
                      title="Admin?"
                      key="admin"
                      align="center"
                      render={(_, record) => (
                        <Switch
                          checkedChildren={<FontAwesomeIcon icon={faCheck} />}
                          unCheckedChildren={<FontAwesomeIcon icon={faClose} />}
                          defaultChecked={record.admin}
                          onChange={(e) =>
                            handleChange(e, record.uuid, "admin")
                          }
                        />
                      )}
                    /> */}
                  </Table>
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

export default Dashboard;
