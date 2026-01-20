export default function KeepInTouch() {
  return (
    <div
      className="pre-footer hide-on-small-height"
      style={{
        background: "url('/images/Vector-footer.png')",
        backgroundPosition: "50%",
        backgroundSize: "cover",
        maringTop: "10em",
      }}
    >
      <div className="pre-footer-content">
        <p className="contact-text">Keep in touch</p>
        <span>
          Register to use our wide range of tools
          {/* <button
            className="btn btn-white mvb-button"
            style={{ marginLeft: "10px" }}
            onClick={() => navigate("/register")}
          >
            Register Now
          </button> */}
        </span>
      </div>
    </div>
  );
}
