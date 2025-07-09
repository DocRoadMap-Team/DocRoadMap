/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import AccessibilityButton from "./AccessibilityButton";
import { applyAltSettings } from "./accessibilityUtils";

interface CorrectAltsProps {
  updateSettings: (settings: any) => void;
}

const CorrectAlts: React.FC<CorrectAltsProps> = ({ updateSettings }) => {
  const [enabled, setEnabled] = useState<boolean>(false);

  // Charger l'état au démarrage
  useEffect(() => {
    const stored = localStorage.getItem("accessibility-settings");
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        setEnabled(settings.altEnabled || false);
      } catch (e) {
        console.error("Error parsing stored settings:", e);
      }
    }
  }, []);

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);

    // Utiliser le hook centralisé pour mettre à jour
    updateSettings({ altEnabled: newEnabled });

    if (newEnabled) {
      applyAltSettings(true);
    }
  };

  return (
    <div>
      <AccessibilityButton
        labelF="Disable alt with AI"
        labelS="Add alt with AI"
        onClick={handleToggle}
        enabled={enabled}
      />
    </div>
  );
};

export default CorrectAlts;
