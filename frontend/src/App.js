import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { ConfigProvider, theme } from "antd";
import { useSelector } from "react-redux";
import Login from "./pages/UserManagement/Login";
import Register from "./pages/UserManagement/Register";
import Forgot from "./pages/UserManagement/Forgot";
import ResetPassword from "./pages/UserManagement/ResetPassword";
import TermsConditons from "./pages/Dashboard/TermsConditions";
import ContactUs from "./pages/Dashboard/ContactUs";
import Dashboard from "./pages/Dashboard/Dashboard";
import MapWrapper from "./pages/Map/Map";
import Forecast from "./pages/Forecast/Forecast";
import Home from "./pages/Dashboard/Home";
import FeedbackPage from "./pages/Dashboard/Feedback";

import "./style/App.css";
import UserManual from "./pages/Dashboard/UserManual";

function App() {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const { darkmode } = useSelector((state) => state);
  return (
    <ConfigProvider
      theme={{
        algorithm: darkmode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route
            path="map"
            element={
              <MapWrapper heading="Pakistan Drought Managament System" />
            }
          />
          <Route
            path="forecast"
            element={<Forecast heading="Pakistan Drought Managament System" />}
          />
          <Route
            path="contactus"
            element={<ContactUs heading="Contact Us" />}
          />
          <Route
            path="dashboard"
            element={<Dashboard heading="Administrator Panel" />}
          />
          <Route path="login" element={<Login heading="Login" />} />
          <Route path="register" element={<Register heading="Register" />} />
          <Route path="forgot" element={<Forgot heading="Forgot Password" />} />
          <Route
            path="resetpassword/:id"
            element={<ResetPassword heading="Reset Password" />}
          />
          <Route
            path="home"
            element={<Home heading="Pakistan Drought Managament System" />}
          />
          <Route
            path="terms-conditions"
            element={
              <TermsConditons heading="Terms & Conditions" footer="Sign In" />
            }
          />
          <Route
            path="usermanual"
            element={
              <UserManual heading="User Manual" footer="Sign In" />
            }
          />
          <Route
            path="feedback"
            element={<FeedbackPage heading="Feedback" />}
          />
          <Route
            path="*"
            element={<Home heading="Pakistan Drought Managament System" />}
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
