import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./signupConfirm.css";

const isDev = process.env.NODE_ENV !== "production";

const docroadmapImg = isDev
  ? "/assets/docroadmap.png"
  : "../assets/docroadmap.png";

function SignupConfirm() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="confirmation-header">
          <div className="DocRoadMap-Logo confirmation">
            <img src={docroadmapImg} alt="DocRoadMap" />
          </div>
        </div>
        <p>{t("instruction")}</p>
        <div className="button-group">
          <button className="login-button" onClick={handleLoginRedirect}>
            {t("login")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupConfirm;
