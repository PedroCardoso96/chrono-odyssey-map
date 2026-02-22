// src/hooks/useMapEventListeners.ts
import { useEffect, useRef, useCallback } from "react";
import type L from "leaflet";
import { useMarkers } from "../contexts/MarkersContext";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";

interface MapEventListenersProps {
  mapRef: React.MutableRefObject<L.Map | null>;
  user: any;
  onMarkerClick?: (position: { lat: number; lng: number }) => void;
  onResize?: () => void;
}

export function useMapEventListeners({
  mapRef,
  user,
  onMarkerClick,
  onResize,
}: MapEventListenersProps) {
  const { deleteMarker } = useMarkers();
  const { showModal } = useModal();
  const isAdmin = user?.isAdmin || false;

  const eventListenersRef = useRef<{
    contextMenu?: (e: L.LeafletMouseEvent) => void;
    popupOpen?: (e: L.PopupEvent) => void;
    resize?: () => void;
  }>({});

  const handleContextMenu = useCallback(
    (e: L.LeafletMouseEvent) => {
      // ✅ ADICIONADO: console.log para depuração
      //console.log("handleContextMenu disparado! Evento:", e); 

      if (!user) {
        //console.log("Usuário NÃO logado. Mostrando modal de acesso negado.");
        showModal({
          title: "Acesso Negado",
          body: "Você precisa fazer login para adicionar marcadores!",
        });
        return;
      }
      // ✅ ADICIONADO: console.log para depuração quando logado
      //console.log("Usuário logado. Chamando onMarkerClick com:", e.latlng);
      onMarkerClick?.(e.latlng);
    },
    [user, onMarkerClick, showModal]
  );

  const handleResize = useCallback(() => {
    onResize?.();
  }, [onResize]);

  const handlePopupOpen = useCallback(
    (e: L.PopupEvent) => {
      if (!isAdmin) return;

      const popupNode = e.popup.getElement();
      if (!popupNode) return;

      const btnRemove = popupNode.querySelector(".remove-marker-btn");
      if (btnRemove && btnRemove.parentNode) {
        const newBtn = btnRemove.cloneNode(true) as HTMLElement;
        btnRemove.parentNode.replaceChild(newBtn, btnRemove);

        newBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const id = Number(newBtn.getAttribute("data-id"));
          
          showModal({
            title: "Confirmar Exclusão",
            body: "Tem certeza de que deseja remover este marcador permanentemente?",
            isConfirmation: true,
            confirmText: "Remover",
            onConfirm: async () => {
              await deleteMarker(id);
              mapRef.current?.closePopup();
            }
          });
        });
      }
    },
    [isAdmin, deleteMarker, mapRef, showModal]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.on("contextmenu", handleContextMenu);
    window.addEventListener("resize", handleResize);

    if (isAdmin) {
      map.on("popupopen", handlePopupOpen);
    }

    return () => {
      map.off("contextmenu", handleContextMenu);
      window.removeEventListener("resize", handleResize);
      if (isAdmin) {
        map.off("popupopen", handlePopupOpen);
      }
    };
  }, [mapRef, handleContextMenu, handlePopupOpen, handleResize, isAdmin]);
}