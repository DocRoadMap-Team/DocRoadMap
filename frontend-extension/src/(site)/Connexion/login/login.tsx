import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./login.css";

const env = import.meta.env.VITE_ENV_MODE;
const backendUrl = (env === "development") ? "http://localhost:8082" : "https://www.docroadmap.fr";

const isDev = process.env.NODE_ENV !== "production";
const docroadmapImg = isDev
  ? "/assets/docroadmap.png"
  : "../assets/docroadmap.png";

const ArrowLeftIcon = FaArrowLeft as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = () => {
    axios
      .post(`${backendUrl}/auth/login`, { email, password })
      .then((response) => {
        const token = response.data.accessToken;
        localStorage.setItem("token", token);
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.local.set({ token }, () => {
            console.log("Token saved in chrome.storage :", token);
          });
        }
        if (token) {
          if (chrome?.tabs?.query && chrome?.tabs?.sendMessage) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: "logToken",
                  token,
                });
              }
            });
          }
          navigate("/roadmap");
        }
      })
      .catch(() => {
        setError(t("error"));
        console.error("Login failed.");
      });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeftIcon />
        </button>

        <div className="login-header">
          <img src={docroadmapImg} alt="DocRoadMap" />
        </div>
        {!isResetMode ? (
          <>
            {error && <p className="error-message">{error}</p>}
            <div className="input-group small">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group small">
              <input
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-group small">
              <button className="login-button" onClick={handleLogin}>
                {t("login")}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>{t("reset")}</h2>
            <div className="input-group small">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <p className="back-to-login" onClick={() => setIsResetMode(false)}>
              {t("back")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
