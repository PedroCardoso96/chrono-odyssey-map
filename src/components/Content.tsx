import React from "react";
import NewsBlock from "./NewsBlock";
import GameCard from "./GameCard";

export default function Content() {
  return (
    <div
      className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#1a1a1a]"
      style={{ gridTemplateColumns: "1fr auto 1fr" }}
    >
      {/* ================================================================== */}
      {/* == BLOCO 1: PAINEL ESQUERDO (COMENTADO) == */}
      {/* ================================================================== */}
      {/*
      <div className="image-border bg-[#1a1a1a] shadow-lg p-3 flex flex-col h-full w-full items-center justify-start">
        <NewsBlock />
      </div>
      */}

      {/* ================================================================== */}
      {/* == BLOCO 2: PAINEL CENTRAL (ATIVO) == */}
      {/* ================================================================== */}
      <div className="col-start-2 flex justify-center">
        <div className="image-border bg-[#1f1e1b] shadow-lg p-1 flex flex-col h-[400px] w-[850px]">
          <iframe
            src="https://player.twitch.tv/?channel=serialhealer_&parent=chronoodyssey.com.br&parent=www.chronoodyssey.com.br"
            frameBorder="0"
            allowFullScreen
            scrolling="no"
            height="100%"
            width="auto"
            title="Twitch Player"
          ></iframe>
        </div>
      </div>

      {/* ================================================================== */}
      {/* == BLOCO 3: PAINEL DIREITO (COMENTADO) == */}
      {/* ================================================================== */}
      {/*
      <div
        className="
          image-border
          p-[2px]
          shadow-lg rounded-none flex flex-col justify-end h-full
          relative overflow-visible
        "
      >
        <GameCard
          href="https://tinyurl.com/56e95rxv"
          coverSrc="../guias/berserker.webp"
          characterSrc="/berserker2.webp"
        />
      </div>
      */}
    </div>
  );
}
