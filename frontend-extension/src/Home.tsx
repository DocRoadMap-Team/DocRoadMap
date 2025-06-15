import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const isDev = process.env.NODE_ENV !== "production";

const docroadmapImg = isDev
  ? "/assets/docroadmap.png"
  : "../assets/docroadmap.png";

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const getToken = (): Promise<string | null> => {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          chrome.storage.local.get("token", (result) => {
            resolve(result.token ?? null);
          });
        } else {
          resolve(localStorage.getItem("token"));
        }
      });
    };

    getToken().then((token) => {
      if (token) {
        navigate("/docroadmap");
      }
    });
  }, [navigate]);

  return (
    <div className="home-container">
      <div className="DocRoadMap-Logo">
        <img src={docroadmapImg} alt="DocRoadMap" />
      </div>
      <button onClick={() => navigate("/login")}>{t("login")}</button>

      <button onClick={() => navigate("/register")}>{t("register")}</button>
    </div>
  );
}

export default Home;
