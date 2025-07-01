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
          <img src={docroadmapImg} alt="DocRoadMap" />
        </div>
        <p className="confirmation-message">{t("instruction")}</p>
        <button className="confirmation-button" onClick={handleLoginRedirect}>
          {t("login")}
        </button>
      </div>
    </div>
  );
}

export default SignupConfirm;
