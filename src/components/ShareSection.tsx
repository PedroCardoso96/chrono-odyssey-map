import React, { useState } from 'react';
// Removido: import de todos os ícones do lucide-react, pois agora usaremos SVGs diretamente

// --- Componente Reutilizável para os Cards de Compartilhamento ---
interface ShareCardProps {
  platformName: string;
  description: string;
  // AJUSTE: Agora aceita imgSrc para o caminho do SVG
  iconSrc: string; 
  shareAction: () => void;
  buttonText: string;
}

const ShareCard: React.FC<ShareCardProps> = ({ platformName, description, iconSrc, shareAction, buttonText }) => {
  return (
    <div className="flex flex-col items-center bg-[#1a1a1a] border border-[#2a2a1a] rounded-xl shadow-lg p-6 text-center h-full">
      <div className="text-[#c2a763] mb-4">
        {/* AJUSTE: Renderiza o ícone como uma tag <img> com o SVG */}
        <img src={iconSrc} alt={`${platformName} icon`} className="w-8 h-8" /> 
      </div>
      <h3 className="text-xl font-semibold text-[#c2a763] mb-2">{platformName}</h3>
      <p className="text-sm text-gray-400 mb-4 flex-grow">{description}</p>
      <button
        onClick={shareAction}
        className="bg-[#c2a763] text-[#0d0d0d] font-bold py-3 px-6 rounded-lg hover:bg-[#a08a50] transition-colors duration-300 shadow-md"
      >
        {buttonText}
      </button>
    </div>
  );
};

// --- Componente Principal da Seção de Compartilhamento ---
const ShareSection: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null); // Estado para a mensagem de feedback
  const websiteUrl = "https://www.chronoodyssey.com.br/"; // URL do seu site
  const shareText = "Explore the Chrono Odyssey universe with the ultimate interactive map! Find locations, quests, and more."; // Texto padrão para compartilhamento

  // Função para exibir a mensagem de feedback
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null); // Esconde a mensagem após 3 segundos
    }, 3000);
  };

  // Função para copiar o link para a área de transferência
  const copyToClipboard = async (text: string) => {
    try {
      // Usar document.execCommand('copy') é mais compatível com iframes (como o Canvas)
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showMessage("Link copied to clipboard!"); // Usa a função de feedback
    } catch (err) {
      console.error('Falha ao copiar:', err);
      showMessage("Error copying link. Please copy manually."); // Usa a função de feedback
    }
  };

  return (
    // AJUSTE AQUI: Alterado 'py-16' para 'pt-8' para reduzir o padding superior
    <section className="pt-8 pb-16 px-4 bg-[#0d0d0d]">
      <div className="container mx-auto max-w-[1900px]">
        <h2 className="text-4xl font-bold text-[#c2a763] mb-12 text-center">
          Share on your Media
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card para X (Twitter) */}
          <ShareCard
            platformName="X (Twitter)"
            description="Help us spread the word about the Chrono Odyssey interactive map on X (Twitter)!"
            iconSrc="/x.svg" // Caminho para o SVG do X (Twitter)
            buttonText="Share"
            shareAction={() => {
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(websiteUrl)}`,
                '_blank'
              );
            }}
          />

          {/* Card para Reddit */}
          <ShareCard
            platformName="Reddit"
            description="Share the Chrono Odyssey interactive map with the Reddit community!"
            iconSrc="/reddit.svg" // Caminho para o SVG do Reddit
            buttonText="Share"
            shareAction={() => {
              window.open(
                `https://www.reddit.com/submit?url=${encodeURIComponent(websiteUrl)}&title=${encodeURIComponent("Chrono Odyssey Interactive Map - The ultimate tool for your adventure in Setera!")}`,
                '_blank'
              );
            }}
          />

          {/* Card para WhatsApp */}
          <ShareCard
            platformName="WhatsApp"
            description="Send the Chrono Odyssey interactive map link to your friends on WhatsApp!"
            iconSrc="/whatsapp.svg" // Caminho para o SVG do WhatsApp
            buttonText="Share"
            shareAction={() => {
              window.open(
                `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + websiteUrl)}`,
                '_blank'
              );
            }}
          />

          {/* Card para Discord (Copiar Link) */}
          <ShareCard
            platformName="Discord"
            description="Copy the website link and share it in your Discord servers and chats!"
            iconSrc="/discord.svg" // Caminho para o SVG do Discord
            buttonText="Copy Link"
            shareAction={() => copyToClipboard(websiteUrl)}
          />
        </div>
      </div>
      {/* Mensagem de feedback (substitui alert()) */}
      {message && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}
    </section>
  );
};

export default ShareSection;
