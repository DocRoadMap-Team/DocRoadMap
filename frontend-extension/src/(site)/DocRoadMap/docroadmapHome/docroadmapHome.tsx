import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { FaGlobe, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./docroadmapHome.css";

const UserIcon = FaUser as unknown as React.FC<any>;
const GlobeIcon = FaGlobe as unknown as React.FC<any>;
const SignOutIcon = FaSignOutAlt as unknown as React.FC<any>;

const isDev = process.env.NODE_ENV !== "production";

const docroadmapImg = isDev
  ? "/assets/docroadmap.png"
  : "../assets/docroadmap.png";

const authorizedDomains = [
  /\.ameli\.fr$/,
  /\.apec\.fr$/,
  /\.caf\.fr$/,
  /\.demarches-simplifiees\.fr$/,
  /\.energie-info\.fr$/,
  /\.franceconnect\.gouv\.fr$/,
  /\.francetravail\.fr$/,
  /\.gouv\.fr$/,
  /\.impots\.gouv\.fr$/,
  /\.laposte\.fr$/,
  /\.legifrance\.gouv\.fr$/,
  /\.mes-aides\.gouv\.fr$/,
  /\.mesdroitssociaux\.gouv\.fr$/,
  /\.orientation-pour-tous\.fr$/,
  /\.service-public\.fr$/,
];

function isAuthorizedUrl(url: string | null): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return authorizedDomains.some((regex) => regex.test(hostname));
  } catch {
    return false;
  }
}

const LOGOUT_EXPIRY_KEY = "logout_expiry_time";
const LOGOUT_DELAY = 3600000;

const DocroadmapHome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const getActiveTabUrl = (): Promise<string | null> => {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.tabs) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs?.[0]?.url) {
              resolve(tabs[0].url);
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      });
    };

    getActiveTabUrl().then((url) => {
      setIsAuthorized(isAuthorizedUrl(url));
    });
  }, []);

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

  const goToProfile = () => navigate("/profile");
  const changeLanguage = () => navigate("/language");
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    localStorage.removeItem(LOGOUT_EXPIRY_KEY);
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.remove("token", () => {});
    }
    navigate("/");
  };

  if (isAuthorized === null) {
    return (
      <div className="roadmap-container">
        <div className="DocRoadMap-Logo">
          <img src={docroadmapImg} alt="DocRoadMap" />
        </div>
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="roadmap-container">
        <div className="DocRoadMap-Logo">
          <img src={docroadmapImg} alt="DocRoadMap" />
        </div>
        <div className="not-authorized-message">
          <p>
            <Trans
              i18nKey="Not-authorized-for-DocRoadMap"
              components={{ br: <br />, strong: <strong /> }}
            />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap-container">
      <div className="settings-container">
        <h1 className="roadmap-header">{t("settings")}</h1>
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
