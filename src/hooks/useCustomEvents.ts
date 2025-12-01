import { useEffect, useRef } from "react";
import L from "leaflet";

interface CenterOnMarkerEvent {
  lat: number;
  lng: number;
  zoom: number;
  label: string;
}

interface CustomEventsProps {
  mapRef: React.MutableRefObject<L.Map | null>;
}

export function useCustomEvents({ mapRef }: CustomEventsProps) {
  const eventListenersRef = useRef<{
    centerOnMarker?: (event: CustomEvent<CenterOnMarkerEvent>) => void;
  }>({});

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Handler para centralizar no marcador
    const handleCenterOnMarker = (event: CustomEvent<CenterOnMarkerEvent>) => {
      const { lat, lng, zoom, label } = event.detail;
      
      // Centraliza o mapa na posição do marcador
      map.setView([lat, lng], zoom, { animate: true });
      
      // Opcional: mostra um popup temporário com o nome do marcador
      const tempPopup = L.popup()
        .setLatLng([lat, lng])
        .setContent(`<strong>${label}</strong>`)
        .openOn(map);
      
      // Remove o popup após 3 segundos
      setTimeout(() => {
        map.closePopup(tempPopup);
      }, 3000);
    };

    // Adiciona o event listener
    eventListenersRef.current.centerOnMarker = handleCenterOnMarker;
    window.addEventListener("centerOnMarker", handleCenterOnMarker as EventListener);

    // Cleanup function
    return () => {
      if (eventListenersRef.current.centerOnMarker) {
        window.removeEventListener("centerOnMarker", eventListenersRef.current.centerOnMarker as EventListener);
      }
      eventListenersRef.current = {};
    };
  }, [mapRef]);

  return {
    // Função para disparar evento de centralizar no marcador
    centerOnMarker: (data: CenterOnMarkerEvent) => {
      window.dispatchEvent(
        new CustomEvent("centerOnMarker", { detail: data })
      );
    }
  };
} 