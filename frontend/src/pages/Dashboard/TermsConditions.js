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
  zIndex: 20000,
};
const footerStyle = {
  padding: 0,
  margin: 0,
  zIndex: 5000,
  color: "#fff",
  backgroundColor: "#7dbcea",
  background: "linear-gradient(180deg, #2a547c 0%, #224669 100%)",
};
function TermsConditons(props) {
  return (
    <>
      <Layout style={{ minHeight: "100vh" }} breakpoint="sm">
        <Header style={headerStyle}>
          <CustomHeader heading={props.heading} />
        </Header>
        <Content style={contentStyle}>
          <SubMenu />
          <div
            className="container-layout container-fluid"
            style={{ padding: 0 }}
          >
            <div class="right-img-wrapper">
              <div class="terms-conditions">
                <h2>Terms and Conditions</h2>
                <p class="terms-conditions-body">
                  These Terms of Use govern your access to and use of the PAKDMS
                  website which is managed and administered by the International
                  Water Management Institute (“IWMI”).
                </p>
                <p class="terms-conditions-body">
                  By accessing or using the Site, you agree to be bound by these
                  Terms. If you do not agree to be bound by these Terms, please
                  promptly exit the Site. In addition, specific terms of use may
                  be indicated in connection with certain Materials (as defined
                  below), in which case your access to such Materials shall be
                  governed by these Terms, subject to such specific terms of
                  use.
                </p>
                <br />
                <h5>What Information Does PAKDMS Collect?</h5>
                <br />
                <h6>Personal information</h6>
                <p class="terms-conditions-body">
                  You can access and use the Site without providing any personal
                  information. If you register for an email newsletter, you may
                  be asked for information that helps to identify you, such as
                  your name, email address, organization and website. This
                  information is used for technical and customer administration
                  of the Site only and is not shared with third parties.
                </p>
                <h6>Use of cookies and web beacons</h6>
                <p class="terms-conditions-body">
                  When you register for one of our services, PAKDMS sets a
                  cookie, a small bit of code stored on your computer’s hard
                  drive that enables you to manage your subscriptions and online
                  profile. By setting this cookie, PAKDMS will remember you the
                  next time you visit and won’t have to bother you by asking
                  questions you have already answered (like address
                  information).
                </p>
                <p class="terms-conditions-body">
                  You are always free to decline our cookies if your browser
                  permits, although in that case you may not be able to use
                  certain features on the Site and may be required to re-enter
                  information more frequently to use certain services on the
                  Site.
                </p>
                <h6>IP Addresses</h6>
                <p class="terms-conditions-body">
                  In addition, PAKDMS also records your IP address, which is the
                  Internet address of your computer, and information such as
                  your browser type and operating system. This information helps
                  us learn about the geographical distribution of visitors to
                  our Site and the technology they use to access the Site.
                </p>
                <h6>Third Party Sites</h6>
                <p class="terms-conditions-body">
                  The Site may feature aggregated content from third party
                  websites (including websites of CGIAR centers and CGIAR
                  research) and/or include links to such websites. This Privacy
                  Policy does not apply to such aggregated content or to such
                  third-party websites, which are governed by their own privacy
                  policies.
                </p>
                <h6>How to Contact Us</h6>
                <p class="terms-conditions-body">
                  If you have any questions or concerns about our Privacy
                  Policy, please contact us.
                </p>
                <h6>Changes</h6>
                <p class="terms-conditions-body">
                  PAKDMS reserves the right to modify this Privacy Policy in its
                  discretion at any time, such modifications being effective
                  when posted
                </p>
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
export default TermsConditons;
