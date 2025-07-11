import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./Home.css";

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

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const getActiveTabUrl = (): Promise<string | null> => {
      return new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome.tabs) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0] && tabs[0].url) {
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
      {isAuthorized === false ? (
        <div className="not-authorized-message">
          <p>{t("Not-authorized-for-DocRoadMap")}</p>
        </div>
      ) : (
        <>
          <button onClick={() => navigate("/login")}>{t("login")}</button>
          <button onClick={() => navigate("/signup")}>{t("signup")}</button>
        </>
      )}
    </div>
  );
}

export default Home;
