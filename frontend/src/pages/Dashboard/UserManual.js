import CustomFooter from "../../components/Footer";
import CustomHeader from "../../components/Header";
import { Layout } from "antd";
import SubMenu from "../../components/SubMenu";

const { Header, Footer, Content } = Layout;

const headerStyle = {
  textAlign: "center",
  color: "#fff",
  background: "linear-gradient(180deg, #5C4033, #C4A484)",
  zIndex: 15000,
};
const contentStyle = {
  background: "#fff",
  paddingBottom: "10rem",
  zIndex: 20000,
};
const footerStyle = {
  padding: 0,
  margin: 0,
  zIndex: 50000,
  color: "#fff",
  backgroundColor: "#7dbcea",
  background: "linear-gradient(180deg, #2a547c 0%, #224669 100%)",
};
function UserManual(props) {
  return (
    <>
      <Layout style={{ minHeight: "100vh" }} breakpoint="sm">
        <Header style={headerStyle}>
          <CustomHeader heading={props.heading} />
        </Header>
        <Content style={contentStyle}>
          <SubMenu />
          <div style={{ marginBottom: "5rem" }}>
            <div class="terms-conditions">
              <h2>PakDMS User Manual</h2>
              <div class="terms-conditions-body">
                <div class="toc">
                  <h2>Table of Contents</h2>
                  <ul>
                    <li>
                      <a href="#introduction">1. Introduction</a>
                    </li>
                    <li>
                      <a href="#getting-started">2. Getting Started</a>
                    </li>
                    <li>
                      <a href="#user-interface">3. User Interface</a>
                    </li>
                    <li>
                      <a href="#features">4. Features</a>
                      <ul>
                        <li>
                          <a href="#home">4.1 Home</a>
                        </li>
                        <li>
                          <a href="#map">4.2 Map</a>
                        </li>
                        <li>
                          <a href="#dashboard">4.3 Dashboard</a>
                        </li>
                        <li>
                          <a href="#user-management">4.4 User Management</a>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="#troubleshooting">5. Troubleshooting</a>
                    </li>
                  </ul>
                </div>

                <div id="introduction" class="section">
                  <h4>1. Introduction</h4>
                  <p className="terms-conditions-body">
                    PakDMS (Pakistan Drought Monitoring System) is a web-based
                    application designed to monitor and analyze drought
                    conditions in Pakistan. This user manual provides
                    comprehensive guidance on how to use the various features
                    and functionalities of the PakDMS website.
                  </p>
                  <img
                    src="./images/Manual/homepage_screenshot.png"
                    alt="PakDMS Homepage"
                    style={{ width: "100%" }}
                  />
                </div>

                <div id="getting-started" class="section">
                  <h4>2. Getting Started</h4>
                  <p className="terms-conditions-body">
                    To access PakDMS, visit{" "}
                    <a href="https://pakdms.iwmi.org">
                      https://pakdms.iwmi.org
                    </a>{" "}
                    in your web browser. The system is designed to work with
                    modern web browsers such as Chrome, Firefox, Safari, and
                    Edge.
                  </p>
                </div>

                <div id="user-interface" class="section">
                  <h4>3. User Interface</h4>
                  <p className="terms-conditions-body">
                    The PakDMS interface consists of several key components:
                  </p>
                  <ul>
                    <li>
                      Header: Contains navigation menu and user account options
                    </li>
                    <li>
                      Home Page: Provides an overview of the system and its
                      features
                    </li>
                    <li>
                      Map View: The main area displaying geographic data and
                      layers
                    </li>
                    <li>
                      Dashboard: For administrators to manage the system and
                      users
                    </li>
                    <li>
                      User Management: Handles user registration, login, and
                      password recovery
                    </li>
                  </ul>
                  <img
                    src="./images/Manual/main_screenshot.png"
                    alt="PakDMS Login Page"
                    style={{ width: "100%" }}
                  />
                </div>

                <div id="features" class="section">
                  <h4>4. Features</h4>

                  <div id="home" class="section">
                    <h5>4.1 Home</h5>
                    <p className="terms-conditions-body">
                      The Home page provides an overview of the Pakistan Drought
                      Management System, including:
                    </p>
                    <ul>
                      <li>
                        Introduction to the system's purpose and capabilities
                      </li>
                      <li>Quick links to important features</li>
                      <li>Latest updates or announcements</li>
                    </ul>
                    {/* <!-- Add a screenshot of the home page here -->
                  <!-- <img src="path/to/home_page_screenshot.jpg" alt="PakDMS Home Page" class="screenshot"> --> */}
                  </div>

                  <div id="map" class="section">
                    <h5>4.2 Map</h5>
                    <p className="terms-conditions-body">
                      The Map page is the core functionality of PakDMS, offering
                      a range of features for visualizing and analyzing drought
                      data:
                    </p>

                    <h6>4.2.1 Map Navigation</h6>
                    <ul>
                      <li>Pan and zoom the map using standard map controls</li>
                      <li>Scale Control: Displays the current map scale</li>
                      <li>North Arrow: Indicates the map orientation</li>
                    </ul>
                    <img
                      src="./images/Manual/map_screenshot.png"
                      alt="PakDMS Login Page"
                      style={{ width: "100%" }}
                    />
                    <h6>4.2.2 Layer Management</h6>
                    <ul>
                      <li>
                        Select from various drought indices and data layers
                      </li>
                      <li>
                        Swipe Mode: Compare two selected layers side by side
                      </li>
                      <li>
                        Opacity Control: Adjust the transparency of the active
                        layer
                      </li>
                    </ul>
                    <img
                      src="./images/Manual/sidebar_screenshot.png"
                      alt="PakDMS Login Page"
                      style={{ width: "100%" }}
                    />
                    <h6>4.2.3 Analysis Tools</h6>
                    <ul>
                      <li>Drawing Tools: Create custom areas for analysis</li>
                      <li>
                        Graph Generation: Visualize data for selected areas
                      </li>
                      <li>Time Series Analysis: View changes over time</li>
                    </ul>
                    <img
                      src="./images/Manual/tools_screenshot.png"
                      alt="PakDMS Login Page"
                      style={{ width: "100%" }}
                    />

                    <h6>4.2.4 Data Visualization</h6>
                    <ul>
                      <li>
                        View drought indices and other relevant data on the map
                      </li>
                      <li>Toggle between different visualization options</li>
                    </ul>
                    <img
                      src="./images/Manual/visualization_screenshot.png"
                      alt="PakDMS Login Page"
                      style={{ width: "100%" }}
                    />
                    <h6>4.2.5 User Guidance</h6>
                    <ul>
                      <li>
                        Website Tour: Guided introduction to map features for
                        new users
                      </li>
                    </ul>
                    <img
                      src="./images/Manual/guidance_screenshot.png"
                      alt="PakDMS Login Page"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div id="dashboard" class="section">
                    <h5>4.3 Dashboard</h5>
                    <p className="terms-conditions-body">
                      The Dashboard is accessible to administrators and provides
                      tools for managing the system and its users:
                    </p>
                    <h6>4.3.1 User Management</h6>
                    <ul>
                      <li>View a list of all registered users</li>
                      <li>
                        User information display: First name, last name,
                        username/email
                      </li>
                      <li>Pagination: Navigate through the list of users</li>
                      <li>
                        User Approval: Approve or disapprove user accounts
                      </li>
                      <li>
                        Admin Privileges: Grant or revoke administrative access
                        for users
                      </li>
                    </ul>
                    <img
                      src="./images/Manual/usermanagement_screenshot.png"
                      alt="PakDMS Homepage"
                      style={{ width: "100%" }}
                    />
                    <h6>4.3.2 System Management</h6>
                    <ul>
                      <li>Monitor system performance and usage statistics</li>
                      <li>Manage system settings and configurations</li>
                    </ul>
                    {/* <!-- Add a screenshot of the system management interface here -->
                  <!-- <img src="path/to/system_management_screenshot.jpg" alt="System Management Interface" class="screenshot"> --> */}
                    <h6>4.3.3 Data Management</h6>
                    <ul>
                      <li>Update and maintain drought data and indices</li>
                      <li>Manage data sources and integrations</li>
                    </ul>
                    {/* <!-- Add a screenshot of the data management interface here -->
                  <!-- <img src="path/to/data_management_screenshot.jpg" alt="Data Management Interface" class="screenshot"> --> */}
                  </div>

                  <div id="user-management" class="section">
                    <h5>4.4 User Management</h5>
                    <p className="terms-conditions-body">
                      User Management features include:
                    </p>
                    <h6>4.4.1 User Registration</h6>
                    <ul>
                      <li>
                        Create a new account by providing necessary information
                      </li>
                      <li>
                        Verification process to ensure valid user accounts
                      </li>
                    </ul>
                    <img
                      src="./images/Manual/register_screenshot.png"
                      alt="PakDMS Login Page"
                      style={{ width: "100%" }}
                    />
                    <h6>4.4.2 Login</h6>
                    <ul>
                      <li>
                        Secure access to the platform using username and
                        password
                      </li>
                      <li>Error handling for incorrect login attempts</li>
                    </ul>
                    <img
                      src="./images/Manual/login_screenshot.png"
                      alt="PakDMS Login Page"
                      style={{ width: "100%" }}
                    />
                    <h6>4.4.3 Password Recovery</h6>
                    <ul>
                      <li>
                        Reset forgotten passwords through a secure process
                      </li>
                      <li>Email-based password reset functionality</li>
                    </ul>
                    <img
                      src="./images/Manual/forgot_screenshot.png"
                      alt="PakDMS Login Page"
                      style={{ width: "100%" }}
                    />
                    <h6>4.4.4 User Profile Management</h6>
                    <ul>
                      <li>Update personal information and account settings</li>
                      <li>Change password and other security settings</li>
                    </ul>
                    {/* <!-- Add a screenshot of the user profile management interface here -->
                  <!-- <img src="path/to/user_profile_management_screenshot.jpg" alt="User Profile Management Interface" class="screenshot"> --> */}
                  </div>
                </div>

                <div id="troubleshooting" class="section">
                  <h5>5. Troubleshooting</h5>
                  <p className="terms-conditions-body">
                    If you encounter any issues while using PakDMS, please try
                    the following steps:
                  </p>
                  <ol>
                    <li>Refresh the page</li>
                    <li>Clear your browser cache</li>
                    <li>Try using a different web browser</li>
                    <li>Check your internet connection</li>
                    <li>
                      Ensure you're using the latest version of your browser
                    </li>
                    <li>Contact support if the issue persists</li>
                  </ol>
                </div>
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
export default UserManual;
