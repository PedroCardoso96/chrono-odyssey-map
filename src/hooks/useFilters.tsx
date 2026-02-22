import { useState } from 'react';
import { MARKER_TYPES } from '../config/markersConfig';

export function useFilters() {
  // Inicializa todos os filtros como false (desselecionados)
  const [filters, setFilters] = useState(() => {
    const initial: { [key: string]: boolean } = {};
    MARKER_TYPES.forEach(marker => {
      initial[marker.key] = true;
    });
    return initial;
  });

  const toggleFilter = (filterType: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const hideAll = () => {
    setFilters(prev => {
      const newFilters = { ...prev };
      Object.keys(newFilters).forEach(key => {
        newFilters[key] = false;
      });
      return newFilters;
    });
  };

  const showAll = () => {
    setFilters(prev => {
      const newFilters = { ...prev };
      Object.keys(newFilters).forEach(key => {
        newFilters[key] = true;
      });
      return newFilters;
    });
  };

  return { filters, toggleFilter, hideAll, showAll };
}
