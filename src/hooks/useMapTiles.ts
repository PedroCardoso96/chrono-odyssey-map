// Este hook inicializa o mapa Leaflet, camada de tiles e minimapa.
// Ele retorna a referência do mapa e a função para centralizar o mapa considerando a sidebar.

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet-minimap";
import "leaflet-minimap/dist/Control.MiniMap.min.css";

export function useMapTiles(user: any) {
  const mapRef = useRef<L.Map | null>(null);

  const recenterMapWithSidebar = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const sidebar = document.querySelector(".custom-sidebar") as HTMLElement;
    if (!sidebar) return;
    const offsetX = sidebar.clientWidth / 2;
    map.panBy([offsetX, 0], { animate: false });
  }, []);

  useEffect(() => {
    if (mapRef.current) return;

    // Garante que o container do mapa está limpo antes de inicializar
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      mapContainer.innerHTML = "";
    }

    const maxZoom = 8;
    const maxNativeZoom = 5;
    const numTilesX = 32;
    const numTilesY = 32;
    const tileSize = 256;
    const imageWidth = tileSize * numTilesX;
    const imageHeight = tileSize * numTilesY;
    const initialZoom = 2;

    const map = L.map("map", {
      crs: L.CRS.Simple,
      zoom: initialZoom,
      minZoom: 2,
      maxZoom: maxZoom,
      zoomControl: false,
      attributionControl: false,
      doubleClickZoom: false,
    });

    const southWest = L.point(0, imageHeight);
    const northEast = L.point(imageWidth, 0);
    const bounds = L.latLngBounds(
      map.unproject(southWest, maxNativeZoom),
      map.unproject(northEast, maxNativeZoom)
    );

    map.setView(bounds.getCenter(), initialZoom);
    map.setMaxBounds(bounds);

    const CustomTileLayer = (L.TileLayer as any).extend({
      getTileUrl: function (coords: any) {
        return `/tiles/tiles/Tiles/${coords.z}/${coords.y}/${coords.x}.webp`;
      },
    });

    new CustomTileLayer("", {
      tileSize,
      noWrap: true,
      bounds,
      minZoom: 2,
      maxZoom: maxZoom,
      // @ts-ignore
      maxNativeZoom: maxNativeZoom,
    }).addTo(map);

    

    window.addEventListener("resize", recenterMapWithSidebar);
    mapRef.current = map;

    return () => {
      window.removeEventListener("resize", recenterMapWithSidebar);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [user, recenterMapWithSidebar]);

  return { mapRef, recenterMapWithSidebar };
} 