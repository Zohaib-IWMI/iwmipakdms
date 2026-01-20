import { Button, Space } from "antd";
import { setselectedKey } from "../slices/mapView";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopyright,
  faEnvelope,
  faRssSquare,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faFlickr,
  faLinkedin,
  faTwitter,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

import "../style/footer.css";
import KeepInTouch from "./KeepInTouch";

function Footer(props) {
  const dispatch = useDispatch();
  return (
    <>
      <div
        className="footer-section"
        style={{
          background: "linear-gradient(180deg, #5C4033 0%, #C4A484 100%)",
          height: "50px",
        }}
      >
        <div className="footer-container container-fluid">
          <div className="align-items-right row">
            <div className="col-md-6 text-left"></div>

            {/* Footer Bottom Text */}
            <div className="row justify-content-left">
              <div className="col-4 text-left">
                <p className="copyright-text copy-text-left follow-text">
                  <FontAwesomeIcon icon={faCopyright} /> &nbsp;2025
                  International Water Management Institute (IWMI)
                </p>
              </div>
              <div className="col-4 text-center">
                <Button
                  href="/terms-conditions"
                  target="_blank"
                  type="link"
                  style={{ color: "white" }}
                  className="footer-terms-style"
                  onClick={() => dispatch(setselectedKey(null))}
                >
                  Terms & Conditions
                </Button>
              </div>
              <div className="col-md-4" style={{ textAlign: "right" }}>
                <ul className="list-unstyled d-flex flex-wrap justify-content-end">
                  <li className="mx-2">
                    <Button
                      type="link"
                      href="https://www.facebook.com/IWMIonFB"
                      target="_blank"
                      style={{ color: "bluer" }}
                      icon={
                        <FontAwesomeIcon
                          icon={faFacebookF}
                          color="bluer"
                          size="2xl"
                        />
                      }
                    />
                  </li>
                  <li className="mx-2">
                    <Button
                      type="link"
                      href="https://www.flickr.com/photos/iwmi"
                      target="_blank"
                      style={{ color: "#ff0084" }}
                      icon={
                        <FontAwesomeIcon
                          icon={faFlickr}
                          color="#ff0084"
                          size="2xl"
                        />
                      }
                    />
                  </li>
                  <li className="mx-2">
                    <Button
                      type="link"
                      href="https://www.linkedin.com/company/international-water-management-institute-iwmi/"
                      target="_blank"
                      style={{ color: "#0077B5" }}
                      icon={<FontAwesomeIcon icon={faLinkedin} size="2xl" />}
                    />
                  </li>
                  <li className="mx-2">
                    <Button
                      type="link"
                      href='mailto:iwmi@cgiar.org?subject="Contact IWMI via PakDMS"'
                      target="_blank"
                      style={{ color: "white" }}
                      icon={
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          color="white"
                          size="2xl"
                        />
                      }
                    />
                  </li>
                  <li className="mx-2">
                    <Button
                      type="link"
                      href="https://www.iwmi.cgiar.org/news/rss-feeds/"
                      target="_blank"
                      style={{ color: "#f26522" }}
                      icon={
                        <FontAwesomeIcon
                          icon={faRssSquare}
                          color="#f26522"
                          size="2xl"
                        />
                      }
                    />
                  </li>
                  <li className="mx-2">
                    <Button
                      type="link"
                      href="https://twitter.com/IWMI_"
                      target="_blank"
                      style={{ color: "black" }}
                      icon={
                        <FontAwesomeIcon
                          icon={faXTwitter}
                          color="black"
                          size="2xl"
                        />
                      }
                    />
                  </li>
                  <li className="mx-2">
                    <Button
                      type="link"
                      href="https://www.youtube.com/user/iwmimedia/videos"
                      target="_blank"
                      style={{
                        color: "red",
                      }}
                      icon={<FontAwesomeIcon icon={faYoutube} size="2xl" />}
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Footer;
