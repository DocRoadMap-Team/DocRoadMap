/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { theme } from "../../utils/Styles";
import Header from "../../utils/Header";
import { FaAccessibleIcon } from "react-icons/fa";
import CorrectAlts from "./CorrectAlts";
import AccessibilityButton from "./AccessibilityButton";
import { applyContrastSettings } from "./accessibilityUtils";
interface ContrastAdjusterProps {
  updateSettings: (settings: any) => void;
}

const ContrastAdjuster: React.FC<ContrastAdjusterProps> = ({
  updateSettings,
}) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("accessibility-settings");
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        setEnabled(settings.contrastEnabled || false);
      } catch (e) {
        console.error("Error parsing stored settings:", e);
      }
    }
  }, []);

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);

    console.log(`Manual contrast toggle: ${newEnabled}`);

    updateSettings({ contrastEnabled: newEnabled });

    // Appliquer immédiatement SEULEMENT lors du clic manuel
    applyContrastSettings(newEnabled, true); // force = true pour les actions manuelles
  };
  return (
    <div role="region" aria-label="Accessibility panel">
      <Header title="Adjust Accessibility" icon={<FaAccessibleIcon />} />
      <div
        style={{
          fontFamily: theme.fontFamily,
          background: theme.backgroundColor,
          color: theme.color,
        }}
      >
        <AccessibilityButton
          labelF="Restore Colors"
          labelS="Adjust Background, Text & Borders"
          onClick={handleToggle}
          enabled={enabled}
        />
        <CorrectAlts updateSettings={updateSettings} />
      </div>
    </div>
  );
};

export default ContrastAdjuster;
