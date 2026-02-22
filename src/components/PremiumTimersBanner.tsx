// src/components/PremiumTimersBanner.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'; // ✅ Adicionado useCallback
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// MODIFICADO: Define a estrutura dos dados do timer que vêm da API
interface TimerData {
  id: string; // O ID do timer (alfanumérico, da combinação de números+letras)
  entityId: number; // NOVO: O ID da entidade que corresponde ao ID do marcador no mapa
  entityName: string;
  category: string;
  location: string;
  nextRespawnAt: string;
  remainingSeconds?: number;
  icon?: string;
}

// Esta lista comanda QUAIS categorias serão exibidas, garantindo que nunca sumam.
const CATEGORY_HEADER_ICONS: Record<string, string> = {
  'chests': '/icons/categories/chests.png',
  'ores': '/icons/categories/ores.png',
  'enemies': '/icons/categories/enemies.png',
  'missions': '/icons/categories/quests.png',
  'plants': '/icons/categories/plants.png',
  'woods': '/icons/categories/woods.png',
  'leather': '/icons/categories/leather.png',
  'events': '/icons/categories/events.png'
};

// Constante para definir o limite de timers por categoria
const MAX_TIMERS_PER_CATEGORY = 20;

// Função para obter o caminho do ícone de um timer individual
const getTimerIconPath = (timer: Pick<TimerData, 'icon'>) => {
  return timer.icon || '/icons/ampulheta.png';
};

// O componente agora é autossuficiente e não precisa de props
const PremiumTimersBanner: React.FC = () => {
  const { user, isLoading: isAuthLoading, token } = useAuth();
  const [timers, setTimers] = useState<TimerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const intervalRef = useRef<number | null>(null);
  const isUserPremium = user?.isPremium || false;

  // <<<<<<<<<<<< PONTO DE CONTROLE: ALTERE ESTA LINHA >>>>>>>>>>>>
  // Defina 'true' para que o banner Premium Timers apareça e funcione para TODOS os usuários (Premium ou não).
  // Defina 'false' para reverter ao comportamento padrão (somente usuários Premium).
  const TEMPORARY_SHOW_FOR_ALL_USERS = false; // <-- Defina 'true' ou 'false' aqui
  // <<<<<<<<<<<<<<<<<<<<<<< FIM DO PONTO DE CONTROLE >>>>>>>>>>>>>>>>>>>>>>

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(6);

  // ✅ MUDANÇA: fetchTimers agora é um useCallback
  const fetchTimers = useCallback(async () => {
    // MODIFICADO: Só NÃO busca os timers se não for premium E a flag temporária estiver DESATIVADA
    if (!isUserPremium && !TEMPORARY_SHOW_FOR_ALL_USERS) {
      setTimers([]);
      setLoading(false);
      return;
    }

    // Se o usuário não estiver autenticado e não for para mostrar para todos,
    // ou se o token ainda não estiver disponível, não faz a requisição.
    if (!token && !TEMPORARY_SHOW_FOR_ALL_USERS) {
        setTimers([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/timers', { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: TimerData[] = await response.json();
      const initialTimers = data.map(timer => {
        const respawnTime = new Date(timer.nextRespawnAt);
        const diffSeconds = Math.max(0, Math.floor((respawnTime.getTime() - Date.now()) / 1000));
        return { ...timer, remainingSeconds: diffSeconds };
      }).filter(timer => timer.remainingSeconds > 0);
      setTimers(initialTimers);
    } catch (e: any) {
      console.error('Falha ao buscar timers:', e);
      setError(e.message || t('premiumTimers.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [isUserPremium, TEMPORARY_SHOW_FOR_ALL_USERS, token, t]); // ✅ MUDANÇA: Dependências do useCallback

  // ✅ MUDANÇA: Este useEffect agora apenas chama fetchTimers uma vez no carregamento ou quando as dependências mudam
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    fetchTimers();
  }, [isAuthLoading, fetchTimers]); // ✅ MUDANÇA: Depende de fetchTimers

  useEffect(() => {
    if (timers.length > 0 && (isUserPremium || TEMPORARY_SHOW_FOR_ALL_USERS)) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        setTimers(prevTimers => {
          const updatedTimers = prevTimers.map(timer => ({
            ...timer,
            remainingSeconds: Math.max(0, (timer.remainingSeconds || 1) - 1),
          })).filter(timer => timer.remainingSeconds > 0);
          if (prevTimers.length > 0 && updatedTimers.length === 0) {
            // Quando todos os timers expiram, chamamos fetchTimers para recarregar
            fetchTimers(); 
          }
          return updatedTimers;
        });
      }, 1000);
    } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timers.length, isUserPremium, TEMPORARY_SHOW_FOR_ALL_USERS, fetchTimers]);

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (window.innerWidth >= 1536) return 6; // 2xl
      if (window.innerWidth >= 1280) return 5; // xl
      if (window.innerWidth >= 1024) return 4; // lg
      if (window.innerWidth >= 768) return 3; // md
      if (window.innerWidth >= 640) return 2; // sm
      return 1; // mobile
    };
    const handleResize = () => {
      setVisibleCategoriesCount(calculateVisibleItems());
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map(unit => String(unit).padStart(2, '0')).join(':');
  };

  const groupedTimers = useMemo(() => {
    const groups: Record<string, TimerData[]> = {};
    timers.forEach(timer => {
      if (!groups[timer.category]) groups[timer.category] = [];
      groups[timer.category].push(timer);
    });
    return Object.keys(groups).sort().reduce((obj: Record<string, TimerData[]>, key) => {
      obj[key] = groups[key].sort((a, b) => (a.remainingSeconds || 0) - (b.remainingSeconds || 0));
      return obj;
    }, {});
  }, [timers]);

  if (isAuthLoading) {
    return <div className="text-center p-4">{t('premiumTimers.loading')}</div>;
  }
  
  if (!TEMPORARY_SHOW_FOR_ALL_USERS && (!user || !isUserPremium)) {
    return (
      <div className="bg-dark-card-bg text-text-white p-4 text-center mt-8 rounded-lg shadow-md border border-dark-border">
        <h3 className="text-xl font-semibold text-accent-gold mb-2">{t('premiumTimers.titleNonPremium')}</h3>
        <p className="text-sm text-text-gray-300 mb-4">{t('premiumTimers.descriptionNonPremium')}</p>
        <Link to="/subscribe" className="bg-accent-gold hover:opacity-90 text-dark-background font-bold py-2 px-4 rounded transition-colors">
          {t('premiumTimers.subscribeButton')}
        </Link>
      </div>
    );
  }

  const allCategoryKeys = Object.keys(CATEGORY_HEADER_ICONS);
  const totalPages = Math.ceil(allCategoryKeys.length / visibleCategoriesCount);
  const canGoNext = carouselIndex < (allCategoryKeys.length - visibleCategoriesCount);
  const canGoPrev = carouselIndex > 0;

  const handleNext = () => {
    if(canGoNext) setCarouselIndex(prev => prev + 1);
  };
  const handlePrev = () => {
    if(canGoPrev) setCarouselIndex(prev => prev - 1);
  };

  const visibleCategoryKeys = allCategoryKeys.slice(carouselIndex, carouselIndex + visibleCategoriesCount);

  return (
    <div className="bg-dark-card-bg text-text-white p-4 rounded-lg shadow-md border border-dark-border">
      <div className="flex items-center justify-center relative">
        <h3 className="w-full font-bold text-lg text-accent-gold text-center">
          {t('premiumTimers.titlePremium')}
        </h3>
        {allCategoryKeys.length > visibleCategoriesCount && (
          <div className="absolute right-0 flex items-center space-x-2">
            <button onClick={handlePrev} disabled={!canGoPrev} className="bg-dark-divider hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-8 h-8 flex items-center justify-center transition-colors">
              &lt;
            </button>
            <button onClick={handleNext} disabled={!canGoNext} className="bg-dark-divider hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-8 h-8 flex items-center justify-center transition-colors">
              &gt;
            </button>
          </div>
        )}
      </div>

      <div className="transition-all duration-300 h-auto overflow-hidden mt-4">
        {loading && <p className="text-center text-text-gray-300 mt-4">{t('premiumTimers.loading')}</p>}
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
        {!loading && !error && (
          <div className="relative flex">
            <AnimatePresence initial={false}>
              {visibleCategoryKeys.map((category) => {
                const categoryTimers = groupedTimers[category] || [];
                const timersToShow = categoryTimers.slice(0, MAX_TIMERS_PER_CATEGORY);

                return (
                  <motion.div
                    key={category}
                    className="flex-shrink-0 w-1/6 p-1"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      width: `${100 / visibleCategoriesCount}%`
                    }}
                  >
                    <div className="bg-dark-background p-3 rounded shadow-sm border border-dark-divider h-[480px]">
                      <div className="flex flex-col items-center justify-center text-center py-1 text-base font-semibold text-text-white mb-2 border-b border-dark-border pb-2">
                        <img
                          src={CATEGORY_HEADER_ICONS[category] || '/icons/categories/default_category.png'}
                          alt={category}
                          className="w-8 h-8 object-contain mb-1"
                        />
                        <span className="text-accent-gold">{t(`mapFilters.${category}`)}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-0.5 mt-2">
                        {timersToShow.map(timer => (
                          <Link
                            key={timer.id}
                            to={`/map#marker=${timer.entityId}`}
                            className="block"
                          >
                            <div className="flex items-center py-0.5 px-1 hover:bg-dark-card-bg rounded transition-colors">
                              <img
                                src={getTimerIconPath(timer)}
                                alt={timer.entityName}
                                className="w-4 h-4 object-contain flex-shrink-0 mr-1"
                              />
                              <div className="flex flex-col flex-grow text-left overflow-hidden">
                                <span className="text-text-gray-300 text-xs font-medium leading-tight whitespace-nowrap">{t(`mapFilters.${timer.entityName}`)}</span>
                                <span className="font-bold text-accent-gold text-xs leading-tight whitespace-nowrap">{formatTime(timer.remainingSeconds || 0)}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                        {timersToShow.length === 0 && (
                          <div className="col-span-2 text-center text-xs text-gray-500 mt-4">
                            Nenhum timer ativo.
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumTimersBanner;
