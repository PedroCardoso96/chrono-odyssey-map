import { useCallback } from "react";

interface CenterOnMarkerData {
  lat: number;
  lng: number;
  zoom: number;
  label: string;
}

export function useAdminActions() {
  // Função para centralizar no marcador
  const centerOnMarker = useCallback((data: CenterOnMarkerData) => {
    window.dispatchEvent(
      new CustomEvent("centerOnMarker", { detail: data })
    );
  }, []);

  return {
    centerOnMarker
  };
} 