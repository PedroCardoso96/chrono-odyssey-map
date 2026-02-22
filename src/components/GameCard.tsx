import React from "react";

interface GameCardProps {
  href: string;
  coverSrc: string;       // imagem de fundo (background)
  characterSrc: string;   // imagem do personagem com transparência
  altCover?: string;
  altCharacter?: string;
  buttonLabel?: string;
}

export default function GameCard({
  href,
  coverSrc,
  characterSrc,
  altCover = "Imagem de fundo",
  altCharacter = "Personagem",
  buttonLabel = "Guia Rápido →",
}: GameCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      className="group relative block w-full h-full overflow-visible shadow-lg cursor-pointer"
      style={{ perspective: 1000 }}
    >
      {/* ── Imagem de fundo com inclinação e fade-out ─────────────── */}
      <img
        src={coverSrc}
        alt={altCover}
        draggable={false}
        className="
          cover-image absolute inset-0 w-full h-full object-cover
          pointer-events-none select-none
          z-0
          transition-all duration-500
          group-hover:brightness-125 group-hover:opacity-40
        "
        style={{
          transformOrigin: "center bottom",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          willChange: "transform, opacity",
          objectPosition: "center 48%",
        }}
      />

      {/* ── Armas aparecem no hover ─────────────────────────────── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20 w-full pointer-events-none select-none">
        {[
          '../guias/chain-blades.webp',
          '../guias/great-axe.webp',
          '../guias/twin-axes.webp',
        ].map((src, idx) => (
          <img
            key={src}
            src={src}
            alt={src.replace('/','').replace('.webp','')}
            className="
              w-35 h-35 object-contain
              opacity-0 translate-y-10
              group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-500
              shadow-lg
            "
            style={{ transitionDelay: `${idx * 80}ms` }}
          />
        ))}
      </div>

      {/* ── Botão opcional ────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#c2a763] text-black font-semibold text-sm py-2 px-4 rounded hover:bg-yellow-600 transition"
        >
          {buttonLabel}
        </a>
      </div>

      {/* ── Efeito no hover do grupo ─────────────────────────────── */}
      {/* <style>{`
        .group:hover .cover-image {
          transform: rotateX(50deg);
          opacity: 0.1;
        }
      `}</style> */}
    </a>
  );
}
