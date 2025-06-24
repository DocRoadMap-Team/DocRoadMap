import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaEnvelope, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./profile.css";

const env = import.meta.env.VITE_ENV_MODE;
const backendUrl =
  env === "development" ? "http://localhost:8082" : "https://www.docroadmap.fr";

const ArrowLeftIcon = FaArrowLeft as unknown as React.FC<any>;
const UserIcon = FaUser as unknown as React.FC<any>;
const EnvelopeIcon = FaEnvelope as unknown as React.FC<any>;

function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [error, setError] = useState<string>("");

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
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
      try {
        const token = await getToken();
        if (!token) {
          throw new Error(t("tokenError"));
        }
        const response = await fetch(`${backendUrl}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(t("fetchError"));
        }
        const data = await response.json();
        setUser({
          firstName: data.firstName || t("notSpecified"),
          lastName: data.lastName || t("notSpecified"),
          email: data.email || t("notSpecified"),
        });
      } catch (err) {
        setError(t("genericError"));
        console.error(err);
      }
    };

    fetchUserProfile();
  }, [t]);

  return (
    <div className="profile-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeftIcon />
      </button>
      <h1 className="profile-title">{t("profil")}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="profile-picture">
        <FaUser size={80} />
      </div>
      <div className="profile-info">
        {["firstName", "lastName", "email"].map((field) => (
          <div className="profile-item" key={field}>
            <span className="profile-label">
              {field === "firstName" || field === "lastName" ? (
                <UserIcon color="black" />
              ) : field === "email" ? (
                <EnvelopeIcon color="black" />
              ) : null}
            </span>
            <span className="profile-value">
              {user[field as keyof typeof user]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
