import i18n from "i18next";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
  FaCalendar,
  FaEye,
  FaRoad,
  FaRobot,
  FaWheelchair,
} from "react-icons/fa";
import ContrastAdjuster from "./components/Accessibility/ContrastAdjuster";
import StepsCalendar from "./components/Calendar/calendar";
import Chatbot from "./components/Chatbot/chatbot";
import ModifyRoadmapChat from "./components/ViewRoadmap/ModifyRoadmapChat";
import RoadmapView from "./components/ViewRoadmap/roadmapView";
import getToken from "./utils/utils";
import DecisionTreeChat from "./components/roadmapCreation/decisionTree";
import { useAccessibilityPersistence } from "./components/Accessibility/UseAccessibilityPersistance";
import logo from "../../public/assets/docroadmap_logo2.png";
import {
  applyContrastSettings,
  applyAltSettings,
} from "./components/Accessibility/accessibilityUtils";

const buttonData = [
  {
    icon: <FaRoad />,
    label: "CreateRoadmapChat",
    description: "Create a new roadmap using chat",
  },
  {
    icon: <FaEye />,
    label: "Voir Roadmap",
    description: "View existing roadmap",
  },
  {
    icon: <FaRobot />,
    label: "Chatbot",
    description: "Open chatbot assistant",
  },
  {
    icon: <FaCalendar />,
    label: "Calendrier",
    description: "Open calendar view",
  },
  {
    icon: <FaWheelchair />,
    label: "Accessibility",
    description: "Open accessibility settings",
  },
];

export const modifyChatState = {
  isOpen: false,
  processId: null as number | null,
};

export const openModifyChat = (processId: number) => {
  modifyChatState.isOpen = true;
  modifyChatState.processId = processId;
  window.rerender?.();
};

export const closeModifyChat = () => {
  modifyChatState.isOpen = false;
  modifyChatState.processId = null;
  window.rerender?.();
};

interface PanelProps {
  activePanel: string | null;
  isOpen: boolean;
  panelHeight: number;
  updateSettings: (settings: any) => void;
}

const Panel: React.FC<PanelProps> = ({
  activePanel,
  isOpen,
  panelHeight,
  updateSettings,
}) => (
  <div
    role="dialog"
    aria-label={`${activePanel} panel`}
    aria-hidden={!isOpen}
    aria-live="polite"
    style={{
      position: "fixed",
      bottom: "90px",
      right: "24px",
      width: `350px`,
      maxWidth: `350px`,
      height: `${panelHeight}px`,
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 4px 16px rgba(5, 3, 51, 0.4)",
      zIndex: 10000,
      opacity: 1,
      overflow: "hidden",
      transform: isOpen ? "translateX(0)" : "translateX(120%)",
      transition:
        "transform 0.4s cubic-bezier(.4,0,.2,1), height 0.4s cubic-bezier(.4,0,.2,1)",
      pointerEvents: isOpen ? "auto" : "none",
    }}
  >
    {activePanel === "CreateRoadmapChat" && <DecisionTreeChat />}
    {activePanel === "Voir Roadmap" && <RoadmapView />}
    {activePanel === "Chatbot" && <Chatbot />}
    {activePanel === "Calendrier" && <StepsCalendar />}
    {activePanel === "Accessibility" && (
      <ContrastAdjuster updateSettings={updateSettings} />
    )}
  </div>
);

declare global {
  interface Window {
    rerender?: () => void;
  }
}

const DocRoadmapBar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isPanelMounted, setIsPanelMounted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(450);

  const { settings, updateSettings } = useAccessibilityPersistence();
  const initialLoadRef = useRef(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [, forceUpdate] = useState(0);
  window.rerender = () => forceUpdate((x) => x + 1);

  useEffect(() => {
    const onLanguageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.language) {
        const newLanguage = changes.language.newValue;
        if (newLanguage && newLanguage !== currentLanguage) {
          setCurrentLanguage(newLanguage);
          i18n.changeLanguage(newLanguage);
        }
      }
    };
    chrome.storage.onChanged.addListener(onLanguageChange);
    return () => {
      chrome.storage.onChanged.removeListener(onLanguageChange);
    };
  }, [currentLanguage]);

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

  useEffect(() => {
    if (activePanel !== "Voir Roadmap" && modifyChatState.isOpen) {
      closeModifyChat();
    }
  }, [activePanel]);

  // appliquer automatiquement les paramètres d'accessibilité
  useEffect(() => {
    if (token && !initialLoadRef.current) {
      initialLoadRef.current = true;
      console.log("Initial accessibility settings application");

      setTimeout(() => {
        if (settings.contrastEnabled) {
          applyContrastSettings(true, true); // force = true pour la première application
        }
        if (settings.altEnabled) {
          applyAltSettings(true);
        }
      }, 200);
    }
  }, [token, settings]);

  // Écouter les changements d'url pour réappliquer les paramètres
  // Utilisation d'un debounce pour éviter trop d'appels rapides
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    const handleUrlChange = (event: CustomEvent) => {
      const newSettings = event.detail;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log("URL changed, reapplying settings after debounce");
        if (newSettings.contrastEnabled) {
          applyContrastSettings(true);
        }
        if (newSettings.altEnabled) {
          applyAltSettings(true);
        }
      }, 300);
    };

    window.addEventListener("urlChanged", handleUrlChange as EventListener);
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener(
        "urlChanged",
        handleUrlChange as EventListener,
      );
    };
  }, []);

  // Gérer l'ouverture et la fermeture du panneau
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

  // Vérifier si le token est disponible avant de rendre le composant
  if (!token) return null;

  const handleButtonClick = (label: string) => {
    setActivePanel((cur) => (cur === label ? null : label));
    if (label === "Calendrier") setPanelHeight(600);
    else setPanelHeight(450);
  };

  return (
    <>
      {isPanelMounted && (
        <Panel
          activePanel={activePanel}
          isOpen={isPanelOpen}
          panelHeight={panelHeight}
          updateSettings={updateSettings}
        />
      )}

      {modifyChatState.isOpen && modifyChatState.processId !== null && (
        <div
          style={{
            position: "fixed",
            right: "375px",
            bottom: "90px",
            width: "320px",
            height: "400px",
            background: "#f9f9fb",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            borderRadius: 8,
            padding: "0.2rem",
            zIndex: 10000,
          }}
        >
          <ModifyRoadmapChat
            processId={modifyChatState.processId}
            onClose={closeModifyChat}
          />
        </div>
      )}

      <nav
        role="navigation"
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
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#1976d2",
            border: "none",
            cursor: "pointer",
          }}
          aria-label={`Doc Roadmap main menu`}
          aria-expanded={open}
        >
          <img
            src={logo}
            alt="Doc Roadmap logo"
            style={{
              borderRadius: "50%",
              border: "2px solid #1976d2",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          />
        </button>

        <div
          role="toolbar"
          aria-label="Doc Roadmap actions"
          aria-hidden={!open}
          aria-live="polite"
          style={{
            display: "flex",
            flexDirection: "row",
            transition: "width 0.4s cubic-bezier(.4,0,.2,1)",
            overflow: "hidden",
            width: open ? 300 : 0,
            opacity: 1,
            pointerEvents: open ? "auto" : "none",
            background: "transparent",
          }}
        >
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
                aria-label={`${btn.description} button`}
                aria-pressed={activePanel === btn.label}
                tabIndex={open ? 0 : -1}
              >
                <span aria-hidden="true">{btn.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default DocRoadmapBar;
