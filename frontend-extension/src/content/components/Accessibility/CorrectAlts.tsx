import React, { useState } from "react"; //{ useState }
import axios from "axios";
import getToken from "../../utils/utils";
import AccessibilityButton from "./AccessibilityButton"; // Assuming you have a button component for accessibility actions

const env = import.meta.env.VITE_ENV_MODE;
const backendUrl =
  env === "development" ? "http://localhost:8082" : "https://www.docroadmap.fr";

const CorrectAlts: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean>(false);

  const handleToggle = () => {
    setEnabled((prev) => !prev);
    if (!enabled) {
      handleFindImages();
    }
  };

  const handleFindImages = async () => {
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>("img"),
    );
    const imagesWithoutAlt = images.filter(
      (img) =>
        (!img.hasAttribute("alt") || img.getAttribute("alt") === "") &&
        (img.src.endsWith(".png") ||
          img.src.endsWith(".jpg") ||
          img.src.endsWith(".jpeg") ||
          img.src.endsWith(".gif") ||
          img.src.endsWith(".webp")),
    );

    // to remove later
    const urls = imagesWithoutAlt.map((img) => img.src);
    console.log("Images without alt attributes:", urls);

    const token = await getToken();
    if (!token) {
      setError("Token non disponible. Veuillez vous connecter.");
      return;
    }

    for (const img of imagesWithoutAlt) {
      try {
        const response = await axios.post(
          `${backendUrl}/ai/query-img`,
          { url: img.src },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.status !== 201) {
          console.error(`Failed to fetch alt for image: ${img.src}`);
          continue;
        }
        const data = response.data;
        if (data.alt) {
          img.alt = data.alt;
          console.log(`Updated alt for image ${img.src}: ${data.alt}`);
        }
      } catch (error) {
        console.error(`Error fetching alt for image ${img.src}:`, error);
      }
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
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default CorrectAlts;
