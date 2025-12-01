import React from "react";
import { useTranslation } from "react-i18next";

export default function NewsBlock() {
  const { t, i18n } = useTranslation();

  return (
    <div className="w-full text-[#f1f1f1] px-2 py-1 space-y-4">
      <h2 className="text-xl font-bold border-b border-[#555555] pb-2 mb-2">
        📰 {t("news.title")}
      </h2>

      <div className="space-y-3 text-sm leading-relaxed">
        <div>
          <h3 className="font-semibold text-[#d4af37]">
            ✅ {t("news.closedBetaTitle")}
          </h3>
          <p>{t("news.closedBetaDescription")}</p>
        </div>

        <div>
          <h3 className="font-semibold text-[#d4af37]">
            🛠️ {t("news.nextStepsTitle")}
          </h3>
          <p>{t("news.nextStepsDescription")}</p>
        </div>

        <div>
          <h3 className="font-semibold text-[#d4af37]">
            🎥 {t("news.trailerTitle")}
          </h3>
          <p>{t("news.trailerDescription")}</p>
        </div>
      </div>

      <div className="text-xs text-gray-100 pt-4 border-t border-[#555555]">
        {t("news.updatedOn")}{" "}
        {new Date().toLocaleDateString(
          i18n.language === "en" ? "en-US" : "pt-BR"
        )}{" "}
        • {t("news.sources")}{" "}
        <a
          className="underline text-blue-300 hover:text-blue-200"
          href="https://x.com/ChronoOdyssey"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("news.officialX")}
        </a>{" "}
        |{" "}
        <a
          className="underline text-blue-300 hover:text-blue-200"
          href="https://www.chronoodyssey.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("news.officialSite")}
        </a>
      </div>
    </div>
  );
}
