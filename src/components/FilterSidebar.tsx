// src/components/FilterSidebar.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react'; // Adicionado ícone de busca
import { MARKER_TYPES } from '../config/markersConfig';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

// Suas constantes CATEGORIES e CATEGORY_SEPARATORS permanecem as mesmas
const CATEGORIES = {
	woods: { nameKey: 'woods', icon: '', color: '#228B22' },
    plants: { nameKey: 'plants', icon: '', color: '#228B22' },
    herbs: { nameKey: 'herbs', icon: '', color: '#228B22' },
    ores: { nameKey: 'ores', icon: '', color: '#4169E1' },
    leather: { nameKey: 'leather', icon: '', color: '#4169E1' },
    animals: { nameKey: 'animals', icon: '', color: '#4169E1' },
    enemies: { nameKey: 'enemies', icon: '', color: '#FF4500' },
    npcs: { nameKey: 'npcs', icon: '', color: '#32CD32' },
    structures: { nameKey: 'structures', icon: '', color: '#4169E1' },
    cities: { nameKey: 'cities', icon: '', color: '#4169E1' },
    missions: { nameKey: 'missions', icon: '', color: '#4169E1' },
    events: { nameKey: 'events', icon: '', color: '#4169E1' },
    chests: { nameKey: 'chests', icon: '', color: '#228B22' },
    FieldBoss: { nameKey: 'fieldBoss', icon: '', color: '#FF4500' },
    RegionBoss: { nameKey: 'regionBoss', icon: '', color: '#FF4500' },
};
const CATEGORY_SEPARATORS = [
    { key: 'resources', labelKey: 'mapFilters.resources_separator', categories: ['plants', 'herbs', 'ores', 'leather', 'woods', 'chests'] },
    { key: 'missions', labelKey: 'mapFilters.missions_separator', categories: ['missions', 'events'] },
];


interface FilterSidebarProps {
  filters: Record<string, boolean>;
  toggleFilter: (key: string) => void;
  hideAll: () => void;
  showAll: () => void;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onClearAll?: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  toggleFilter,
  hideAll,
  showAll,
  isOpen,
  onClose,
  isAdmin = false,
  onClearAll,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(''); // <-- NOVO ESTADO PARA A BUSCA
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  // ✅ Lógica de filtragem por busca
  const filteredMarkerTypes = useMemo(() => {
    if (!searchTerm) {
      return MARKER_TYPES;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return MARKER_TYPES.filter(marker =>
      t(`mapFilters.${marker.labelKey || marker.key}`).toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm, t]);

  const grouped = useMemo(() => {
    const gp: Record<string, typeof MARKER_TYPES> = {};
    Object.keys(CATEGORIES).forEach(k => (gp[k] = []));
    // Usa os marcadores já filtrados pela busca
    filteredMarkerTypes.forEach(m => {
        if(gp[m.category]) {
            gp[m.category].push(m)
        }
    });
    return gp;
  }, [filteredMarkerTypes]);


  const allOn = (markers: typeof MARKER_TYPES) => markers.every(m => filters[m.key]);
  const activeCnt = (markers: typeof MARKER_TYPES) => markers.filter(m => filters[m.key]).length;

  const setVis = (markers: typeof MARKER_TYPES, v: boolean) =>
    markers.forEach(m => (filters[m.key] !== v) && toggleFilter(m.key));

  const renderCat = useCallback((catKey: string) => {
    const cat = CATEGORIES[catKey];
    const markers = grouped[catKey] || [];
    if (!markers.length) return null;

    const open = openCats[catKey] || !!searchTerm; // <-- Mantém categorias abertas durante a busca
    const everyOn = allOn(markers);

    return (
      <div key={catKey} className="category-section image-border">
        <button type="button" onClick={() => !searchTerm && setOpenCats(p => ({ ...p, [catKey]: !p[catKey] }))} className="w-full flex items-center justify-between p-3 image-border transition-colors bg-filter-button-bg hover:bg-filter-button-hover-bg">
          <div className="flex items-center space-x-3">
            <span className="text-accent-gold font-medium truncate">{t(`mapFilters.${cat.nameKey}`)}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor:'rgba(0,0,0,.13)', color:'#c2a763', border:'1px solid rgb(194,167,99)', minWidth:38, textAlign:'center' }}>{activeCnt(markers)}/{markers.length}</span>
            <span onClick={e => { e.stopPropagation(); setVis(markers, !everyOn); }} className="cursor-pointer text-accent-gold hover:text-donate-text-gold transition" title={everyOn ? t('mapFilters.hideAll') : t('mapFilters.showAll') }>
              {everyOn ? <EyeOff size={18} strokeWidth={1.8}/> : <Eye size={18} strokeWidth={1.8}/>}
            </span>
            <span className={`text-accent-gold transition-transform duration-200 ${open?'rotate-90':''}`}>
              <img src="/botaosidebar.png" alt={t('mapFilters.open')} className="w-5 h-5"/>
            </span>
          </div>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${open?'max-h-96 opacity-100':'max-h-0 opacity-0'}`}>
          <div className="p-1 grid grid-cols-3 gap-2">
            {markers.map(m => (
              <label key={m.key} className="flex items-start space-x-2 cursor-pointer p-1 rounded hover:bg-dark-border transition-colors group">
                <input type="checkbox" checked={filters[m.key]||false} onChange={() => toggleFilter(m.key)} className="mt-1 w-3 h-3 text-accent-gold rounded focus:ring-accent-gold focus:ring-1 flex-shrink-0"/>
                <span className="text-accent-gold text-xs font-medium group-hover:text-donate-text-gold transition-colors truncate">{t(`mapFilters.${m.labelKey||m.key}`)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }, [openCats, grouped, filters, t, searchTerm]);


  return (
    <div className={`custom-sidebar image-border-2 bg-dark-card-bg ${isOpen?'':'closed'}`}>
      <div className="sidebar-header relative">
        <div className="flex flex-col">
          <span className="text-accent-gold font-bold text-[20px]">{t('mapFilters.title')}</span>
          <span className="text-accent-gold font-bold text-[12px]">{t('mapFilters.clickShowAll')}</span>
        </div>
        <button type="button" onClick={onClose} className="toggle-close-btn absolute right-0 top-0" style={{ zIndex: 9999 }} title={t('mapFilters.open')}>
          <img src="/botaosidebar.png" alt={t('mapFilters.open')} className="w-7 h-7 -scale-x-100 z-50" />
        </button>
        <div className="absolute right-0 top-14 pr-1"><LanguageSwitcher/></div>
      </div>

      <div className="sidebar-content">
        <div className="mb-4 flex gap-2">
          <button type="button" onClick={hideAll} className="image-border flex-1 flex items-center justify-center gap-1 bg-filter-button-bg hover:bg-filter-button-hover-bg text-accent-gold font-bold py-2 text-lg shadow transition-colors" style={{minWidth:0}}>{t('mapFilters.hideAll')}</button>
          <button type="button" onClick={showAll} className="image-border flex-1 flex items-center justify-center gap-1 bg-filter-button-bg hover:bg-filter-button-hover-bg text-accent-gold font-bold py-2 text-lg shadow transition-colors" style={{minWidth:0}}>{t('mapFilters.showAll')}</button>
        </div>
        
        {/* ✅ CAMPO DE BUSCA ADICIONADO */}
        <div className="relative mb-4">
            <input
                type="text"
                placeholder="Buscar marcador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-background border border-dark-border text-text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-accent-gold"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <div className="space-y-1">
          {CATEGORY_SEPARATORS.map(sep => (
            <React.Fragment key={sep.key}>
              <div className="w-full flex items-center justify-center my-2">
                <span className="text-accent-gold font-bold text-[14px] text-center border-b border-accent-gold w-3/4 block">{t(sep.labelKey)}</span>
              </div>
              {sep.categories.map(catKey => renderCat(catKey))}
            </React.Fragment>
          ))}
          {Object.keys(CATEGORIES).filter(k => !CATEGORY_SEPARATORS.some(sep => sep.categories.includes(k))).map(k => renderCat(k))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
