// Componente de popup para seleção do tipo de marcador ao adicionar um novo. E ao Modal

import { MARKER_TYPES } from "../config/markersConfig";

const CATEGORY_LABELS: Record<string, string> = {
  plants: "Plants",
  ores: "Ores",
  leather: "Leather",
  animals: "Animals",
  missions: "Missions",
  events: "Events",
  enemies: "Enemies",
  npcs: "NPCs",
  structures: "Structures",
  cities: "Cities",
  chests: "Chests",
  woods: "Woods",
  
  // adicione outros conforme necessário
};

interface ResourcePopupProps {
  selectedType: string;
  setSelectedType: (type: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResourcePopup({ selectedType, setSelectedType, onConfirm, onCancel }: ResourcePopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-[#1a1a1a] p-6 rounded-lg border-2 border-[#3a3a3a] text-gray-200 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 text-center">
          Selecione o tipo de marcador
        </h3>
        <select
          className="w-full bg-[#2f2f2f] text-white border border-[#3a3a3a] rounded p-3 mb-4 text-center"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {[
            "plants",
            "ores",
            "leather",
            "animals",
            "missions",
            "events",
            "enemies",
            "npcs",
            "structures",
            "cities",
          	"chests",
          	"woods"
   
          ].map((category) => (
            <optgroup key={category} label={`=====${CATEGORY_LABELS[category] || category}=====`}>
              {MARKER_TYPES.filter((m) => m.category === category).map((marker) => (
                <option key={marker.key} value={marker.key}>
                  {marker.icon} {marker.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="flex gap-3">
          <button
            className="flex-1 bg-grey-800 hover:bg-dark-900 text-[#c2a763] py-3 px-4 rounded font-semibold transition-colors"
            onClick={onConfirm}
          >
            Confirmar
          </button>
          <button
            className="flex-1 bg-grey-800 hover:bg-dark-900 text-[#c2a763] py-3 px-4 rounded font-semibold transition-colors"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
} 