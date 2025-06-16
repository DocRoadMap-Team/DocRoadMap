import React, { useEffect, useState } from "react";
import {
  FaCalendar,
  FaEye,
  FaRegFileAlt,
  FaRoad,
  FaRobot,
} from "react-icons/fa";
import Chatbot from "./components/Chatbot/chatbot";
import RoadmapView from "./components/ViewRoadmap/roadmapView";
import StepsCalendar from "./components/Calendar/calendar";
import getToken from "./utils/utils";
import DecisionTreeChat from "./components/roadmapCreation/decisionTree";

const buttonData = [
  { icon: <FaRoad />, label: "CreateRoadmapChat" },
  { icon: <FaEye />, label: "Voir Roadmap" },
  { icon: <FaRobot />, label: "Chatbot" },
  { icon: <FaCalendar />, label: "Calendrier" },
];

interface PanelProps {
  activePanel: string | null;
  isOpen: boolean;
}

const Panel: React.FC<PanelProps> = ({ activePanel, isOpen }) => (
  <div
    style={{
      position: "fixed",
      bottom: "90px",
      right: "80px",
      width: "300px",
      maxWidth: "300px",
      height: "450px",
      background: "#fff",
      border: "1px solid #1976d2",
      borderRadius: 8,
      boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
      zIndex: 10000,
      padding: 8,
      opacity: 1,
      transform: isOpen ? "translateX(0)" : "translateX(120%)",
      transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
      pointerEvents: isOpen ? "auto" : "none",
    }}
  >
    {activePanel === "CreateRoadmapChat" && <DecisionTreeChat />}
    {activePanel === "Voir Roadmap" && <RoadmapView />}
    {activePanel === "Chatbot" && <Chatbot />}
    {activePanel === "Calendrier" && <StepsCalendar />}
  </div>
);

const DocRoadmapBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isPanelMounted, setIsPanelMounted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Token logic
  useEffect(() => {
    getToken().then(setToken);

    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      const onChanged = (
        changes: { [key: string]: chrome.storage.StorageChange },
        area: string,
      ) => {
        if (area === "local" && changes.token) {
          setToken(changes.token.newValue ?? null);
        }
      };
      chrome.storage.onChanged.addListener(onChanged);
      return () => {
        chrome.storage.onChanged.removeListener(onChanged);
      };
    } else {
      const onStorage = (e: StorageEvent) => {
        if (e.key === "token") {
          setToken(e.newValue);
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener("storage", onStorage);
      };
    }
  }, []);

  // Panel mounting/unmounting and animation logic
  useEffect(() => {
    if (activePanel) {
      setIsPanelMounted(true);
      setTimeout(() => setIsPanelOpen(true), 10);
    } else if (isPanelMounted) {
      setIsPanelOpen(false);
      const timeout = setTimeout(() => setIsPanelMounted(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [activePanel, isPanelMounted]);

  if (!token) return null;

  const handleButtonClick = (label: string) => {
    setActivePanel((cur) => (cur === label ? null : label));
  };

  return (
    <>
      {isPanelMounted && (
        <Panel activePanel={activePanel} isOpen={isPanelOpen} />
      )}

      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => {
            setOpen((o) => !o);
            setActivePanel(null);
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#1976d2",
            color: "white",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            fontSize: 28,
            cursor: "pointer",
          }}
          aria-label="Doc Roadmap"
        >
          <FaRegFileAlt />
        </button>

        {/* Animated Bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            transition: "width 0.4s cubic-bezier(.4,0,.2,1)", // match panel
            overflow: "hidden",
            width: open ? 300 : 0,
            opacity: 1,
            pointerEvents: open ? "auto" : "none",
            background: "transparent",
          }}
        >
          {/* Slide content in/out */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              transform: open ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
              width: "100%",
              height: "100%",
            }}
          >
            {buttonData.map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleButtonClick(btn.label)}
                style={{
                  margin: "0 8px",
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: activePanel === btn.label ? "#1976d2" : "#fff",
                  color: activePanel === btn.label ? "#fff" : "#1976d2",
                  border: "1px solid #1976d2",
                  fontSize: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                aria-label={btn.label}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DocRoadmapBar;
