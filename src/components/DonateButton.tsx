// src/components/DonateButton.tsx
import React from 'react';

interface DonateButtonProps {
  href: string;
  icon: string;
  label: string;
}

export default function DonateButton({ href, icon, label }: DonateButtonProps) {
  const handleClick = () => {
    window.open(href, '_blank', 'noopener noreferrer');
  };

  return (
    // Usando as novas classes de cor do Tailwind para doação
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="bg-donate-bg-base/80 hover:bg-donate-bg-hover/90 text-donate-text-gold text-sm px-3 py-1.5 rounded-md flex items-center gap-2 shadow border border-donate-text-gold/20 transition-colors"
    >
      <img src={icon} alt={label} className="w-5 h-5" />
      {label}
    </button>
  );
}