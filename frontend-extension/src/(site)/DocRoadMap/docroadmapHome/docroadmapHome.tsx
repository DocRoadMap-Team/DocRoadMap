/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaGlobe, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./docroadmapHome.css";

const UserIcon = FaUser as unknown as React.FC<any>;
const GlobeIcon = FaGlobe as unknown as React.FC<any>;
const SignOutIcon = FaSignOutAlt as unknown as React.FC<any>;

const LOGOUT_EXPIRY_KEY = "logout_expiry_time";
const LOGOUT_DELAY = 3600000; // 1 hour in milliseconds

const DocroadmapHome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToProfile = () => {
    navigate("/profile");
  };
  const changeLanguage = () => {
    navigate("/language");
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    localStorage.removeItem(LOGOUT_EXPIRY_KEY);
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.remove("token", () => {
        console.log("Token supprimé de chrome.storage");
      });
    }
    navigate("/");
  };

  useEffect(() => {
    const expiry = localStorage.getItem(LOGOUT_EXPIRY_KEY);
    let expiryTime: number;

    if (!expiry) {
      expiryTime = Date.now() + LOGOUT_DELAY;
      localStorage.setItem(LOGOUT_EXPIRY_KEY, expiryTime.toString());
    } else {
      expiryTime = parseInt(expiry, 10);
    }

    const now = Date.now();
    const remaining = expiryTime - now;

    if (remaining <= 0) {
      logout();
    } else {
      const timeout = setTimeout(logout, remaining);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="roadmap-container">
      <div className="settings-content">
        <h1 className="roadmap-title">{t("settings")}</h1>
        <div className="roadmap-buttons">
          <button onClick={goToProfile}>
            <UserIcon className="button-icon" />
            <span className="button-text">{t("profile")}</span>
          </button>
          <button onClick={changeLanguage}>
            <GlobeIcon className="button-icon" />
            <span className="button-text">{t("language")}</span>
          </button>
          <button onClick={logout}>
            <SignOutIcon className="button-icon" />
            <span className="button-text">{t("logout")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocroadmapHome;
