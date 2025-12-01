/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Cores neutras do seu tema escuro (ajustadas para sua paleta)
        'dark-background': '#0d0d0d',
        'dark-card-bg': '#1a1a1a',
        'dark-border': '#2a2a1a',
        'dark-divider': '#333',

        // Sua cor de destaque principal
        'accent-gold': '#c2a763',

        // Cores para o botão de doação (específicas para o estilo que você já tinha)
        'donate-bg-base': '#1f1a0c',
        'donate-bg-hover': '#2c240f',
        'donate-text-gold': '#FFD700',

        // Cores de texto
        'text-white': '#ffffff',
        'text-gray-400': '#9ca3af',
        'text-gray-300': '#d1d5db',

        // !!! NOVAS CORES ADICIONADAS PARA O FILTERSIDEBAR !!!
        'filter-button-bg': '#202020',          // Fundo dos botões da sidebar de filtro
        'filter-button-hover-bg': '#303030',    // Fundo dos botões da sidebar de filtro no hover
      },
    },
  },
  plugins: [],
}