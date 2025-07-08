import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./signup.css";

const backendUrl = "https://www.docroadmap.fr";

// const env = import.meta.env.VITE_ENV_MODE;
// const backendUrl =
//   env === "development" ? "http://localhost:8082" : "https://www.docroadmap.fr";

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

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.(com)$/i;
    return regex.test(email);
  };

  const nextStep = () => {
    setError("");
    setStep((prev) => prev + 1);
  };

  const prevStep = () =>
    step === 1 ? navigate("/") : setStep((prev) => prev - 1);

  const handleEmailStep = () => {
    setError("");
    if (!isValidEmail(email)) {
      setError(t("invalid_email"));
      return;
    }
    nextStep();
  };

  const handleRegister = (e?: React.FormEvent | React.MouseEvent) => {
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              nextStep();
            }}
          >
            <div className="input-group small">
              <input
                type="text"
                placeholder={t("firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="input-group small">
              <input
                type="text"
                placeholder={t("lastName")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="register-button-wrapper">
              <button className="register-button" type="submit">
                {t("continue") || "Continuer"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailStep();
            }}
          >
            <div className="input-group small">
              <input
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="register-button-wrapper">
              <button className="register-button" type="submit">
                {t("continue")}
              </button>
            </div>
            {error && <p className="signup-error">{error}</p>}
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleRegister}>
            <div className="input-group small">
              <input
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group small">
              <input
                type="password"
                placeholder={t("confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="register-button-wrapper">
              <button className="register-button" type="submit">
                {t("submit")}
              </button>
            </div>
            {error && <p className="signup-error">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default Signup;
