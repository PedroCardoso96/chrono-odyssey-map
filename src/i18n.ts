import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import pt from "./locales/pt.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import es from "./locales/es.json";

i18n
  .use(LanguageDetector) // Detecta idioma do navegador
  .use(initReactI18next) // Liga com React
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
      es: { translation: es },
    },
    fallbackLng: "en", // Se não detectar, usa ingles
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
