// src/components/RouteCreationPanel.tsx
import React from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RouteCreationPanelProps {
  currentRouteMarkers: any[];
  routeName: string;
  setRouteName: (name: string) => void;
  routeDescription: string;
  setRouteDescription: (description: string) => void;
  onSave: () => void;
  onClear: () => void;
  onClose: () => void;
}

const RouteCreationPanel: React.FC<RouteCreationPanelProps> = ({
  currentRouteMarkers,
  routeName,
  setRouteName,
  routeDescription,
  setRouteDescription,
  onSave,
  onClear,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className="absolute top-0 right-0 h-full w-[320px] bg-dark-card-bg border-l-2 border-accent-gold shadow-2xl z-[9998] flex flex-col p-4 transition-transform duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-dark-border">
        <h3 className="text-lg font-bold text-accent-gold">Criar Nova Rota</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="routeName" className="block text-sm font-medium text-gray-300 mb-1">Nome da Rota</label>
        <input
          type="text"
          id="routeName"
          placeholder="Ex: Rota de Ferro de Setera"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          className="w-full p-2 bg-dark-background border border-dark-border text-text-white rounded-md focus:outline-none focus:ring-1 focus:ring-accent-gold"
        />
      </div>

      {/* ✅ NOVO: Campo de Descrição */}
      <div className="mb-4">
        <label htmlFor="routeDescription" className="block text-sm font-medium text-gray-300 mb-1">Descrição (Opcional)</label>
        <textarea
          id="routeDescription"
          placeholder="Ex: Rota rápida para farmar ferro e prata..."
          value={routeDescription}
          onChange={(e) => setRouteDescription(e.target.value)}
          rows={3}
          className="w-full p-2 bg-dark-background border border-dark-border text-text-white rounded-md focus:outline-none focus:ring-1 focus:ring-accent-gold"
        />
      </div>

      <p className="text-sm text-gray-300 mb-2">Pontos da Rota ({currentRouteMarkers.length})</p>
      <div className="flex-grow bg-dark-background p-2 rounded min-h-[100px] mb-4 overflow-y-auto">
        {currentRouteMarkers.length === 0 ? (
          <p className="text-gray-400 text-sm text-center p-4">Clique nos marcadores no mapa para os adicionar à sua rota.</p>
        ) : (
          <ol className="list-decimal list-inside text-white p-2 space-y-2">
            {currentRouteMarkers.map((marker, index) => (
              <li key={`${marker.id}-${index}`} className="p-1 border-b border-dark-divider text-sm truncate">
                {marker.label}
              </li>
            ))}
          </ol>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <button 
          onClick={onSave}
          className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save size={18} /> Guardar Rota
        </button>
        <button 
          onClick={onClear}
          className="flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 size={18} /> Limpar
        </button>
      </div>
    </div>
  );
};

export default RouteCreationPanel;
