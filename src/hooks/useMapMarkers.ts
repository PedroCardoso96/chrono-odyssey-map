// src/hooks/useMapMarkers.ts
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import L from "leaflet";
import { createIcon, pendingIcon } from "../utils/MarkerIconUtils.js";
import { useMarkers } from "../contexts/MarkersContext.tsx";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

interface Marker {
  id: number;
  lat: number;
  lng: number;
  type: string;
  status?: string;
  label?: string;
  author?: { 
    name: string; 
    nickname?: string; 
    picture?: string; 
    isAdmin?: boolean 
  };
  description?: string;
}

export function useMapMarkers(
  mapRef: React.MutableRefObject<L.Map | null>,
  allMarkers: Marker[],
  filters: Record<string, boolean> | null,
  onLeafletMarkerClick: (markerId: number, lat: number, lng: number) => void
) {
  const markersRef = useRef<Record<number, { data: Marker; leaflet: L.Marker }>>({});
  const [isMarkersReady, setIsMarkersReady] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();

  const isAdmin = useMemo(() => user?.isAdmin || false, [user]);

  const createPopupHtml = useCallback(
    (marker: Marker) => {
      const displayLabel = marker.label || t("popup.unknownMarker");
      const translatedType = t(`mapFilters.${marker.type}`, marker.type);
      
      // Lógica para Identidade do Autor
      const authorHtml = marker.author ? `
        <div class="author-container">
          <img src="${marker.author.picture || '/default-avatar.png'}" class="author-img" />
          <div class="author-info">
            <div style="font-size: 10px; color: #888; margin-bottom: -2px;">${t("popup.by") || 'Por'}:</div>
            <div class="author-name-text">
              ${marker.author.nickname || marker.author.name}
              ${marker.author.isAdmin ? `<span class="staff-tag">STAFF</span>` : ""}
            </div>
          </div>
        </div>
      ` : "";

      return `
        <div class="popup-wrapper">
          <div style="font-weight: 900; font-size: 16px; color: #fff; letter-spacing: 0.5px; text-transform: uppercase;">${displayLabel}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
            <span style="color: #d4af37; font-size: 12px; font-weight: 600;">${translatedType}</span>
            <span style="color: #666; font-size: 10px; font-weight: bold;">#${String(marker.id).padStart(4, '0')}</span>
          </div>
          
          ${marker.description ? `<div style="margin-top: 8px; font-size: 13px; color: #bbb; line-height: 1.4; border-left: 2px solid #d4af37; padding-left: 8px; font-style: italic;">${marker.description}</div>` : ""}
          
          ${authorHtml}
          
          <div class="popup-actions">
            <button class="share-marker-btn share-btn" data-id="${marker.id}">🔗 ${t("Share") || 'SHARE'}</button>
            ${isAdmin ? `<button class="remove-marker-btn" data-id="${marker.id}" style="height: 32px; width: 40px; background: #b91c1c; border-radius: 4px; border: none; color: white; cursor: pointer;">🗑️</button>` : ""}
          </div>
        </div>
      `;
    },
    [isAdmin, t]
  );

  const bindEventsToPopup = useCallback(
    (marker: L.Marker) => {
      marker.off("popupopen");
      marker.on("popupopen", (e) => {
        const popupEl = e.popup.getElement();
        if (!popupEl) return;

        const removeBtn = popupEl.querySelector(".remove-marker-btn") as HTMLButtonElement | null;
        if (removeBtn) {
          removeBtn.onclick = (ev) => {
            ev.stopPropagation();
            const id = Number(removeBtn.getAttribute("data-id"));
            window.dispatchEvent(new CustomEvent('showRemoveMarkerConfirmation', { detail: { id } }));
          };
        }

        const shareBtn = popupEl.querySelector(".share-marker-btn") as HTMLButtonElement | null;
        if (shareBtn) {
          shareBtn.onclick = (ev) => {
            ev.stopPropagation();
            const id = Number(shareBtn.getAttribute("data-id"));
            const fullShareLink = `${window.location.origin}${window.location.pathname}#marker=${id}`;
            navigator.clipboard.writeText(fullShareLink).then(() => {
              alert(t("popup.linkCopied") || 'Link copiado!');
            });
          };
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
          leafletMarker = entry.leaflet;
          const { data: oldData } = entry;

          if (oldData.status !== markerData.status || oldData.type !== markerData.type) {
            const newIcon = markerData.status === "pending" ? pendingIcon : await createIcon(markerData.type);
            leafletMarker.setIcon(newIcon);
          }
          
          leafletMarker.setPopupContent(createPopupHtml(markerData));
          entry.data = markerData;
          bindEventsToPopup(leafletMarker);
        }

        const visible = !filters || filters[markerData.type];
        const onMap = map.hasLayer(leafletMarker);
        if (visible && !onMap) {
          leafletMarker.addTo(map);
        } else if (!visible && onMap) {
          map.removeLayer(leafletMarker);
        }
      }
      setIsMarkersReady(true);
    };
    syncMarkers();
  }, [allMarkers, filters, createPopupHtml, bindEventsToPopup, mapRef]);

  return { leafletMarkerRefs: markersRef.current, isMarkersReady };
}