// Funções utilitárias para criar ícones dos marcadores, incluindo fallback e ícone de pendente.

import L from "leaflet";
import { getMarkerType } from "../config/markersConfig.js";

export const pendingIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function createIcon(type: string): Promise<L.Icon | L.DivIcon> {
  const markerType = getMarkerType(type);
  if (!markerType) {
    return Promise.resolve(
      L.divIcon({
        className: "custom-marker-fallback",
        html: `<div style="background:#000;width:28px;height:28px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;">?</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      })
    );
  }

  const fallbackIcon = L.divIcon({
    className: `custom-marker-${type}-fallback`,
    html: `<div style="width:32px;height:32px;background-color:${markerType.color};border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;color:white;">${markerType.icon || "📌"}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return new Promise<L.Icon | L.DivIcon>((resolve) => {
    const isGif = markerType.iconPath.toLowerCase().endsWith('.gif');
    if (isGif) {
      // Usar L.divIcon com <img> para garantir animação do GIF
      resolve(
        L.divIcon({
          className: `custom-marker-gif custom-marker-${type}`,
          html: `<img src="${markerType.iconPath}" style="width:50px;height:50px;object-fit:contain;" alt="${markerType.label}" />`,
          iconSize: [50, 50],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38],
        })
      );
      return;
    }
    const img = new Image();
    img.onload = () =>
      resolve(
        L.icon({
          iconUrl: markerType.iconPath,
          iconSize: [37.5, 37.5],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      );
    img.onerror = () => resolve(fallbackIcon);
    setTimeout(() => resolve(fallbackIcon), 2000);
    img.src = markerType.iconPath;
  });
} 