import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./signup.css";

const env = import.meta.env.VITE_ENV_MODE;
console.log("Environment mode:", env);
const backendUrl = (env === "development") ? "http://localhost:8082" : "https://www.docroadmap.fr";

const isDev = process.env.NODE_ENV !== "production";
const docroadmapImg = isDev
  ? "/assets/docroadmap.png"
  : "../assets/docroadmap.png";
const ArrowLeftIcon = FaArrowLeft as unknown as React.FC<any>;

function Signup() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () =>
    step === 1 ? navigate(-1) : setStep((prev) => prev - 1);

  const handleRegister = () => {
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }
    axios
      .post(`${backendUrl}/auth/register`, {
        firstName,
        lastName,
        email,
        password,
      })
      .then(() => {
        navigate("/account-confirmation");
      })
      .catch(() => {
        console.error("Registration failed");
      });
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <button className="back-button" onClick={prevStep}>
          <ArrowLeftIcon style={{ width: "20px", height: "20px" }} />
        </button>

        <div className="register-header">
          <img src={docroadmapImg} alt="DocRoadMap" />
        </div>

        {step === 1 && (
          <>
            <div className="input-group small">
              <input
                type="text"
                placeholder={t("firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="input-group small">
              <input
                type="text"
                placeholder={t("lastName")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="register-button-wrapper">
              <button className="register-button" onClick={nextStep}>
                {t("continue") || "Continuer"}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="input-group small">
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="register-button-wrapper">
              <button className="register-button" onClick={nextStep}>
                {t("continue") || "Continuer"}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="input-group small">
              <input
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-group small">
              <input
                type="password"
                placeholder={t("confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="register-button-wrapper">
              <button className="register-button" onClick={handleRegister}>
                {t("submit") || "S'inscrire"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;
