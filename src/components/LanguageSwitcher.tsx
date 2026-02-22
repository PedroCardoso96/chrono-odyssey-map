import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", label: "EN" },
    { code: "pt", label: "PT" },
    { code: "fr", label: "FR" },
    { code: "de", label: "DE" },
	{ code: "es", label: "ES" },
  ];

  const handleChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <select
      value={i18n.language}
      onChange={(e) => handleChange(e.target.value)}
      title="Change Language"
      className="px-2 py-1 text-sm rounded border border-gray-400 bg-transparent text-white hover:bg-gray-700 transition"
      aria-label="Switch Language"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code} className="text-black">
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;
