// src/components/MapComponent.tsx
import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useMarkers } from "../contexts/MarkersContext";
import { useMapTiles } from "../hooks/useMapTiles";
import { useMapMarkers } from "../hooks/useMapMarkers";
import { useMapEventListeners } from "../hooks/useMapEventListeners";
import { useCustomEvents } from "../hooks/useCustomEvents";
import { ResourcePopup } from "./ResourcePopup";
import type L from "leaflet";
import { MARKER_TYPES } from "../config/markersConfig";
import { useAuth } from "../contexts/AuthContext";
import AdminPanel from './AdminPanel';
import { useModal } from "../contexts/ModalContext";

interface MapComponentProps {
  filters: Record<string, boolean> | null;
}

interface ClickPosition {
  lat: number;
  lng: number;
}

const DEEPLINK_MARKER_ZOOM = 6;

export default function MapComponent({ filters }: MapComponentProps) {
  const { approvedMarkers, pendingMarkers, addMarker, deleteMarker } = useMarkers();
  const { user, isLoading } = useAuth();
  const { showModal } = useModal();
  const location = useLocation();

  const [showResourcePopup, setShowResourcePopup] = useState(false);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(null);
  const [selectedType, setSelectedType] = useState<string>(MARKER_TYPES[0]?.key || "");

  const isAdmin = useMemo(() => user?.isAdmin || false, [user]);

  const allMarkers = useMemo(() => {
    if (isLoading) return [];
    if (isAdmin) return [...approvedMarkers, ...pendingMarkers];
    return approvedMarkers.filter(
      (m) => m.status === "approved" || (user && m.authorId === user.id)
    );
  }, [approvedMarkers, pendingMarkers, isAdmin, user, isLoading]);

  const { mapRef, recenterMapWithSidebar } = useMapTiles(user);

  const { leafletMarkerRefs, isMarkersReady } = useMapMarkers(
    mapRef,
    allMarkers,
    filters
  );

  const handleMapClick = useMemo(() => (position: { lat: number; lng: number }) => {
    setClickPosition(position);
    setShowResourcePopup(true);
  }, []);

  useMapEventListeners({
    mapRef,
    user,
    onMarkerClick: handleMapClick,
    onResize: recenterMapWithSidebar
  });

  useCustomEvents({ mapRef });

  useEffect(() => {
    const map = mapRef.current;
    if (!map || allMarkers.length === 0 || !isMarkersReady || Object.keys(leafletMarkerRefs).length === 0) {
        return;
    }

    const hash = location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.substring(1));
    const markerIdFromHash = Number(params.get('marker'));

    if (markerIdFromHash) {
      const targetMarkerData = allMarkers.find(m => m.id === markerIdFromHash);
      const leafletMarkerEntry = leafletMarkerRefs[markerIdFromHash];

      if (targetMarkerData && leafletMarkerEntry && leafletMarkerEntry.leaflet) {
        map.setView([targetMarkerData.lat, targetMarkerData.lng], DEEPLINK_MARKER_ZOOM);
        leafletMarkerEntry.leaflet.openPopup();
      }
    }
  }, [location.hash, mapRef, allMarkers, leafletMarkerRefs, isMarkersReady]);

  useEffect(() => {
    const handleShowRemoveConfirmation = (event: Event) => {
      const { id } = (event as CustomEvent).detail;
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
    };

    window.addEventListener('showRemoveMarkerConfirmation', handleShowRemoveConfirmation);

    return () => {
      window.removeEventListener('showRemoveMarkerConfirmation', handleShowRemoveConfirmation);
    };
  }, [showModal, deleteMarker, mapRef]);

  const confirmAddMarker = async () => {
    if (!clickPosition) return;
    const markerType = MARKER_TYPES.find(t => t.key === selectedType);
    if (!markerType) {
      // ✅ SUBSTITUI alert()
      showModal({ title: "Erro", body: "Tipo de marcador inválido!" });
      return;
    }
    if (!user || !user.id) {
        // ✅ SUBSTITUI alert()
        showModal({ title: "Acesso Negado", body: "Você precisa estar logado para adicionar um marcador!" });
        return;
    }
    try {
      await addMarker({
        lat: clickPosition.lat,
        lng: clickPosition.lng,
        type: selectedType,
        label: markerType.label.toUpperCase(),
        authorId: user.id,
      });
      setShowResourcePopup(false);
    } catch (error) {
      // ✅ SUBSTITUI alert()
      showModal({ title: "Erro", body: `Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}` });
    }
  };

  return (
    <div className="flex w-full h-[100vh]" style={{ backgroundColor: "black" }}>
      <div id="map" className="flex-1 h-full bg-black" />
      {showResourcePopup && (
        <ResourcePopup
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          onConfirm={confirmAddMarker}
          onCancel={() => {
            setShowResourcePopup(false);
            setClickPosition(null);
          }}
        />
      )}
      {isAdmin && (
        <div className="flex-shrink-0 h-full flex flex-col">
          <AdminPanel />
        </div>
      )}
    </div>
  );
}
