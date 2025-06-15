import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./docroadmapHome.css";

const isDev = process.env.NODE_ENV !== "production";
const frenchImg = isDev ? "/assets/France.png" : "../assets/France.png";
const englishImg = isDev ? "/assets/England.png" : "../assets/England.png";
const spanishImg = isDev ? "/assets/Spain.png" : "../assets/Spain.png";

const ArrowLeftIcon = FaArrowLeft as unknown as React.FC<any>;

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    navigate(-1);
  };

  return (
    <div className="roadmap-container">
      <div className="settings-content">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
        </button>
        <h1 className="roadmap-title">{t("languageTitle")}</h1>

        <div className="roadmap-buttons">
          <button onClick={() => handleLanguageChange("fr")}>
            <img src={frenchImg} alt="French flag" className="flag-img" />
          </button>
          <button onClick={() => handleLanguageChange("en")}>
            <img src={englishImg} alt="English flag" className="flag-img" />
          </button>
          <button onClick={() => handleLanguageChange("es")}>
            <img src={spanishImg} alt="Spanish flag" className="flag-img" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
