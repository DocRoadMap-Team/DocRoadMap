import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./signup.css";

const isLocal = process.env.NODE_ENV !== "production";
const backendUrl = isLocal
  ? "http://localhost:8082"
  : "https://www.docroadmap.fr";

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
  const [error, setError] = useState("");

  const nextStep = () => {
    setError("");
    setStep((prev) => prev + 1);
  };

  const prevStep = () =>
    step === 1 ? navigate("/") : setStep((prev) => prev - 1);

  const handleRegister = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("password_mismatch"));
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
        setError("");
        navigate("/signupconfirm");
      })
      .catch(() => {
        setError(t("registration_error"));
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
                {t("submit")}
              </button>
            </div>
            {error && <p className="signup-error">{error}</p>}{" "}
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;
