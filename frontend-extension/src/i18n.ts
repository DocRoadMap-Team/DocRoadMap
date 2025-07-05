import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationES from "./locales/es/translation.json";
import translationFR from "./locales/fr/translation.json";

interface LanguageDetector {
  type: "languageDetector";
  async: boolean;
  init: () => void;
  detect: (callback: (lng: string) => void) => void;
  cacheUserLanguage: (lng: string) => void;
}

const chromeStorageDetector: LanguageDetector = {
  type: "languageDetector",
  async: true,
  init: () => {},
  detect: (callback: (lng: string) => void) => {
    if (!chrome?.storage?.local) {
      callback("fr");
      return;
    }
    chrome.storage.local.get(["lang"], (result: { lang?: string }) => {
      callback(result.lang || "fr");
    });
  },
  cacheUserLanguage: (lng: string) => {
    if (chrome?.storage?.local) {
      chrome.storage.local.set({ lang: lng });
    }
  },
};

const resources = {
  en: { translation: translationEN },
  fr: { translation: translationFR },
  es: { translation: translationES },
};

i18n
  .use(chromeStorageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
