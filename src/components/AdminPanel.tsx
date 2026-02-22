// src/components/AdminPanel.tsx (APENAS ESTE ARQUIVO)

import React, { useState, useEffect, useMemo, memo } from "react";
import { useMarkers } from "../contexts/MarkersContext";
import { useAdminActions } from "../hooks/useAdminActions";

const AdminPanel = memo(() => {
  const { pendingMarkers, approveMarker, rejectMarker } = useMarkers();
  const { centerOnMarker } = useAdminActions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const groupedMarkers = useMemo(() => pendingMarkers.reduce((groups, marker) => {
    const email = marker.author?.email || marker.authorId || "desconhecido";
    if (!groups[email]) {
      groups[email] = {
        user: {
          name: marker.author?.name || "Usuário Desconhecido",
          email,
          picture: marker.author?.picture,
        },
        markers: [],
      };
    }
    groups[email].markers.push(marker);
    return groups;
  }, {} as Record<
    string,
    {
      user: { name: string; email: string; picture?: string };
      markers: typeof pendingMarkers;
    }
  >), [pendingMarkers]);

  function toggleUserExpanded(email: string) {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(email)) {
      newExpanded.delete(email);
    } else {
      newExpanded.add(email);
    }
    setExpandedUsers(newExpanded);
  }

  function handleViewMarker(marker: typeof pendingMarkers[0]) {
    centerOnMarker({
      lat: marker.lat,
      lng: marker.lng,
      zoom: 1,
      label: marker.label,
    });
  }

  async function handleApprove(id: number) {
    try {
      await approveMarker(id);
    } catch (e) {
      alert(
        `Erro ao aprovar marcador: ${
          e instanceof Error ? e.message : "Erro desconhecido"
        }`
      );
    }
  }

  async function handleReject(id: number) {
    try {
      await rejectMarker(id);
    } catch (e) {
      alert(
        `Erro ao rejeitar marcador: ${
          e instanceof Error ? e.message : "Erro desconhecido"
        }`
      );
    }
  }

  useEffect(() => {
    setLoading(false);
  }, []);

  const totalPendingCount = pendingMarkers.length;
  const userCount = Object.keys(groupedMarkers).length;

  return (
    // Contêiner principal do AdminPanel
    <div className="p-2 bg-[#1a1a1a] text-gray-200 border-l border-[#3a3a3a] w-[280px] h-full flex flex-col">
      {/* Header - flex-shrink-0 para que não encolha */}
      <div className="mb-3 text-center border-b border-[#3a3a3a] pb-2 flex-shrink-0">
        <h2 className="text-lg font-bold">
          Marcadores Pendentes ({totalPendingCount})
        </h2>
        <p className="text-xs text-gray-400">
          {userCount} usuário{userCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Conteúdo rolável - ESTE É O NOVO CONTÊINER DE ROLAGEM */}
      {/* Adicionado 'relative' para o posicionamento e 'h-0' para que flex-grow force o cálculo de altura */}
      <div className="flex-grow overflow-y-auto relative h-0"> 
        {loading ? (
          <p className="text-center py-4 text-gray-400">Carregando...</p>
        ) : error ? (
          <p className="text-red-400 text-center py-4">{error}</p>
        ) : userCount === 0 ? (
          <p className="text-gray-400 text-center py-4">Nenhum marcador pendente</p>
        ) : (
          // ESTE DIV AGORA É O CONTEÚDO PRINCIPAL DENTRO DA ÁREA ROLÁVEL
          // Removido 'space-y-2' daqui, pois ele será aplicado nos filhos diretamente se necessário.
          <div> {/* <--- MUDANÇA: Removido 'space-y-2' daqui */}
            {Object.entries(groupedMarkers).map(([email, group]) => {
              const isExpanded = expandedUsers.has(email);
              const markerCount = group.markers.length;

              return (
                <div
                  key={email}
                  className="bg-[#2f2f2f] rounded border border-[#3a3a3a] overflow-hidden mb-2 last:mb-0" // ✅ ADICIONADO: margin-bottom para espaçamento entre grupos de usuários
                >
                  {/* Header do Usuário - flex-shrink-0 para não encolher dentro do item */}
                  <div
                    className="p-3 cursor-pointer hover:bg-[#3a3a3a] transition-colors duration-200 border-b border-[#3a3a3a] flex-shrink-0"
                    onClick={() => toggleUserExpanded(email)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {group.user.picture ? (
                          <img
                            src={group.user.picture}
                            alt={group.user.name}
                            className="w-6 h-6 rounded-full border border-[#3a3a3a]"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#4a4a4a] flex items-center justify-center text-xs">
                            👤
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-200 truncate">
                            {group.user.email}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {group.user.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-[#4a4a4a] text-white px-2 py-1 rounded-full text-xs font-semibold">
                          {markerCount}
                        </span>
                        <span
                          className={`transform transition-transform duration-200 text-gray-400 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de marcadores - AQUI ESTÁ A CAMADA SECUNDÁRIA DE ROLAGEM/EXPANSÃO */}
                  {/* max-h-[600px] é para a expansão do grupo, overflow-hidden para não vazar */}
                  <div
  					className={`transition-all duration-300 ease-in-out ${
    				isExpanded ? "opacity-100" : "max-h-0 opacity-0 overflow-hidden" 
  							}`}
						>
                    {/* Aplica space-y-2 AQUI, para que ele afete apenas os marcadores dentro de um grupo */}
                    <div className="space-y-2 p-2"> 
                      {group.markers.map((marker) => (
                        <div
                          key={marker.id}
                          className="bg-[#1a1a1a] rounded p-2 border border-[#3a3a3a]"
                        >
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="mb-1">
                                  <strong className="text-blue-400">Tipo:</strong>{" "}
                                  {marker.type}
                                </div>
                                <div className="mb-1">
                                  <strong className="text-green-400">Label:</strong>{" "}
                                  {marker.label}
                                </div>
                                <div className="mb-2">
                                  <strong className="text-yellow-400">Posição:</strong>{" "}
                                  {marker.lat.toFixed(2)}, {marker.lng.toFixed(2)}
                                </div>
                                {marker.description && (
                                  <div className="mb-2 text-gray-300 text-xs">
                                    <strong className="text-gray-400">Descrição:</strong>{" "}
                                    {marker.description}
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => handleViewMarker(marker)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                👁️ Ver
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(Number(marker.id));
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
                            >
                              ✅ Aprovar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(Number(marker.id));
                              }}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
                            >
                              ❌ Rejeitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

AdminPanel.displayName = 'AdminPanel';

export default AdminPanel;