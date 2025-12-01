// src/hooks/useMapMarkers.ts
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import L from "leaflet";
import { createIcon, pendingIcon } from "../utils/MarkerIconUtils.js";
import { useMarkers } from "../contexts/MarkersContext.tsx";
// import { isUserAdmin } from "../utils/isUserAdmin.js"; // ✅ REMOVIDO: Não é mais necessário
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext"; // ✅ NOVO: Importa useAuth

interface Marker {
  id: number;
  lat: number;
  lng: number;
  type: string;
  status?: string;
  label?: string;
  author?: { name: string; email: string; picture?: string }; // Adicionado email e picture para o autor
  description?: string;
}

export function useMapMarkers(
  mapRef: React.MutableRefObject<L.Map | null>,
  allMarkers: Marker[],
  filters: Record<string, boolean> | null,
  onLeafletMarkerClick: (markerId: number, lat: number, lng: number) => void // Este parâmetro não será mais usado para o clique direto do marcador Leaflet.
) {
  const markersRef = useRef<Record<
    number,
    { data: Marker; leaflet: L.Marker }
  >>({});
  const [isMarkersReady, setIsMarkersReady] = useState(false);

  const { deleteMarker, refreshMarkers } = useMarkers();
  const { t } = useTranslation();
  const { user } = useAuth(); // ✅ MUDANÇA: Obtém o user do useAuth()

  // ✅ MUDANÇA: Use user?.isAdmin diretamente, pois já vem do JWT
  const isAdmin = useMemo(() => user?.isAdmin || false, [user]);

  const customNames: Record<number, string> = { /* NOMES CUSTOMIZADOS POR ID-INUTILIZADO VIA IMPLEMENTAÇÃO DA ADMINDASHBOARD */ };
  const customDescriptions: Record<number, string> = { /* AINDA PODE SER ÚTIL */ };

  const createPopupHtml = useCallback(
    (marker: Marker) => {
      const customLabel = customNames[marker.id] || marker.label || "";
      const translatedType = t(`mapFilters.${marker.type}`, marker.type);
      const descriptionHtml = marker.description ? `<div style='margin: 6px 0 0 0; font-size: 13px; color: #c2a763;'>${marker.description}</div>` : "";
      
      let html = `
        <div style="min-width: 150px;">
          <strong>${customLabel}</strong><br>
          <small>${t("popup.type")}: ${translatedType}</small><br>
          ${marker.author ? `<small>${t("popup.by")}: ${marker.author.name || marker.author.email}</small><br>` : ""}
          <small>ID: ${marker.id}</small><br>
          ${descriptionHtml}
          <button class="share-marker-btn" data-id="${marker.id}" style="margin-top: 8px; padding: 4px 8px; background: #c2a763; color: black; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">🔗 ${t("Share") || 'Compartilhar'}</button>
      `;

      // Apenas mostra o botão de remover se for admin E o marcador for aprovado
      if (isAdmin && marker.status === "approved") {
        html += `
          <button class="remove-marker-btn" data-id="${marker.id}" style="margin-left: 5px; margin-top: 8px; padding: 4px 8px; background: #b91c1c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">🗑️ ${t("popup.remove")}</button>
        `;
      }
      html += `</div>`;
      return html;
    },
    [isAdmin, t] // Depende de isAdmin e t
  );

  const bindEventsToPopup = useCallback(
    (marker: L.Marker) => {
      marker.off("popupopen");
      marker.on("popupopen", (e) => {
        const popupEl = e.popup.getElement();
        if (!popupEl) return;

        const removeBtn = popupEl.querySelector(".remove-marker-btn") as HTMLButtonElement | null;
        if (removeBtn) {
          const newRemoveBtn = removeBtn.cloneNode(true) as HTMLButtonElement;
          removeBtn.parentNode?.replaceChild(newRemoveBtn, removeBtn);
          newRemoveBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const id = Number(newRemoveBtn.getAttribute("data-id"));
            window.dispatchEvent(new CustomEvent('showRemoveMarkerConfirmation', { detail: { id } }));
          });
        }

        const shareBtn = popupEl.querySelector(".share-marker-btn") as HTMLButtonElement | null;
        if (shareBtn) {
          const newShareBtn = shareBtn.cloneNode(true) as HTMLButtonElement;
          shareBtn.parentNode?.replaceChild(newShareBtn, shareBtn);
          
          newShareBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const id = Number(newShareBtn.getAttribute("data-id"));
            
            const fullShareLink = window.location.origin + window.location.pathname + `#marker=${id}`;
            navigator.clipboard.writeText(fullShareLink).then(() => {
              alert(t("popup.linkCopied") || 'Link copiado!');
            }).catch(err => {
              console.error("Erro ao copiar o link: ", err);
            });
          });
        }
      });
    },
    [t]
  );

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const syncMarkers = async () => {
      setIsMarkersReady(false);
      
      Object.keys(markersRef.current).forEach((idStr) => {
        const id = Number(idStr);
        if (!allMarkers.find((m) => m.id === id)) {
          map.removeLayer(markersRef.current[id].leaflet);
          delete markersRef.current[id];
        }
      });

      for (const markerData of allMarkers) {
        const entry = markersRef.current[markerData.id];
        let leafletMarker: L.Marker;

        if (!entry) {
          // Criar novo marcador
          const icon = markerData.status === "pending" ? pendingIcon : await createIcon(markerData.type);
          leafletMarker = L.marker([markerData.lat, markerData.lng], {
            icon,
            // @ts-ignore
            markerId: markerData.id,
          }).bindPopup(createPopupHtml(markerData), {
            className: "custom-popup-black",
          });

          if (!filters || filters[markerData.type]) {
            leafletMarker.addTo(map);
          }
          bindEventsToPopup(leafletMarker);
          markersRef.current[markerData.id] = { data: markerData, leaflet: leafletMarker };
        } else {
          // Atualizar marcador existente
          leafletMarker = entry.leaflet; // ✅ CORRIGIDO: Era 'leaflet', agora 'leafletMarker'
          const { data: oldData } = entry;

          if (oldData.status !== markerData.status || oldData.type !== markerData.type) {
            const newIcon = markerData.status === "pending" ? pendingIcon : await createIcon(markerData.type);
            leafletMarker.setIcon(newIcon); // ✅ CORRIGIDO: Era 'leaflet', agora 'leafletMarker'
          }
          if (oldData.label !== markerData.label || oldData.description !== markerData.description) {
            leafletMarker.setPopupContent(createPopupHtml(markerData)); // ✅ CORRIGIDO: Era 'leaflet', agora 'leafletMarker'
          }
          entry.data = markerData;

          bindEventsToPopup(leafletMarker);
        }

        const visible = !filters || filters[markerData.type];
        const onMap = map.hasLayer(leafletMarker);
        if (visible && !onMap) {
            leafletMarker.addTo(map);
        } else if (!visible && onMap) {
            map.removeLayer(leafletMarker); // ✅ CORRIGIDO: Era 'leaflet', agora 'leafletMarker'
        }
      }
      setIsMarkersReady(true);
    };
    syncMarkers();
  }, [allMarkers, filters, createPopupHtml, bindEventsToPopup, mapRef]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    Object.values(markersRef.current).forEach(({ data, leaflet }) => {
      const visible = !filters || filters[data.type];
      const onMap = map.hasLayer(leaflet);
      if (visible && !onMap) {
        leaflet.addTo(map);
      } else if (!visible && onMap) {
        map.removeLayer(leaflet);
      }
    });
  }, [filters, mapRef]);

  return { leafletMarkerRefs: markersRef.current, isMarkersReady };
}
