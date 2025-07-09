import { useState, useEffect } from "react";

const STORAGE_KEY = "accessibility-settings";

interface AccessibilitySettings {
  contrastEnabled: boolean;
  altEnabled: boolean;
}

const defaultSettings: AccessibilitySettings = {
  contrastEnabled: false,
  altEnabled: false,
};

export const useAccessibilityPersistence = () => {
  const [settings, setSettings] =
    useState<AccessibilitySettings>(defaultSettings);

  // charge paramsau démarrage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings(parsedSettings);
      } catch (e) {
        console.error("Error parsing stored settings:", e);
      }
    }
  }, []);

  // Save params à chaque changement
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Vérif  changements d'url
  useEffect(() => {
    let currentUrl = window.location.href;

    const checkUrlChange = () => {
      if (currentUrl !== window.location.href) {
        currentUrl = window.location.href;
        window.dispatchEvent(
          new CustomEvent("urlChanged", { detail: settings }),
        );
      }
    };

    const interval = setInterval(checkUrlChange, 500);

    return () => clearInterval(interval);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return { settings, updateSettings };
};
