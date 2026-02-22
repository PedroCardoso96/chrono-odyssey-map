// ===================================================================
// 🎯 CONFIGURAÇÃO CENTRAL DOS MARCADORES
// ===================================================================
// Este arquivo centraliza TODOS os tipos de marcadores
// Para ADICIONAR um novo marcador, siga os passos comentados abaixo
// ===================================================================

export interface MarkerType {
  key: string;           // ID único do marcador (sem espaços, minúsculo)
  label: string;         // Nome que aparece na interface
  labelKey?: string;     // NOVO: chave para tradução i18n
  icon: string;          // Emoji temporário (até colocar a imagem)
  description: string;   // Descrição que aparece no filtro
  category: string;      // Categoria para organização
  subCategory?: string;  // Subcategoria
  iconPath: string;      // Caminho para a imagem do ícone
  color: string;         // Cor de fallback caso a imagem não carregue
}

// ===================================================================
// 📝 Crie UM NOVO MARCADOR:
// 
// 1. Adicione o novo tipo no array MARKER_TYPES abaixo
// 2. Coloque a imagem na pasta correspondente em public/icons/markers/
// 3. O sistema automaticamente vai:
//    - Adicionar nos filtros da sidebar
//    - Adicionar no popup de seleção
//    - Criar o ícone no mapa
// 
// FORMATO:
// {
//   key: 'nome_do_tipo',           // ⚠️ ÚNICO, sem espaços
//   label: 'Nome Bonito',          // Como aparece na tela
//   icon: '🎯',                    // Emoji temporário
//   description: 'Descrição...',  // Explicação do que é
//   category: 'categoria',         // Para organizar
//   iconPath: '/icons/markers/categoria/nome.png', // Caminho da imagem
//   color: '#FF0000'               // Cor se a imagem falhar
// }
// ===================================================================

export const MARKER_TYPES: MarkerType[] = [

  //  WOODS =============================================
  
  {
     key: 'archeWood',
     label: 'Arche Wood',
     labelKey: 'archeWood',
     icon: '',
     description: 'Arche Wood',
     category: 'woods',
     iconPath: '/icons/markers/woods/arche-wood.webp',
     color: '#FFA500'
  },
  {
     key: 'redWood',
     label: 'Red Wood',
     labelKey: 'redWood',
     icon: '',
     description: 'Red Wood',
     category: 'woods',
     iconPath: '/icons/markers/woods/red-wood.webp',
     color: '#FFA500'
  },
  
  //  PLANTS =============================================

  {
     key: 'earthShroom',
     label: 'Earthshroom',
     labelKey: 'earthShroom',
     icon: '',
     description: 'Earthshroom',
     category: 'plants',
     iconPath: '/icons/markers/plants/earthshroom.webp',
     color: '#FFA500'
  },
  {
     key: 'ghostShroom',
     label: 'Ghostshroom',
     labelKey: 'ghostShroom',
     icon: '',
     description: 'Ghostshroom',
     category: 'plants',
     iconPath: '/icons/markers/plants/ghostshroom.webp',
     color: '#FFA500'
  },
  {
     key: 'mistShroom',
     label: 'Mistshroom',
     labelKey: 'mistShroom',
     icon: '',
     description: 'Misthroom',
     category: 'plants',
     iconPath: '/icons/markers/plants/mistshroom.webp',
     color: '#FFA500'
  },
  {
     key: 'oxShroom',
     label: 'Oxshroom',
     labelKey: 'oxShroom',
     icon: '',
     description: 'Oxshroom',
     category: 'plants',
     iconPath: '/icons/markers/plants/oxshroom.webp',
     color: '#FFA500'
  },
  {
     key: 'shieldShroom',
     label: 'Shieldshroom',
     labelKey: 'shieldShroom',
     icon: '',
     description: 'Shieldshroom',
     category: 'plants',
     iconPath: '/icons/markers/plants/shieldshroom.webp',
     color: '#FFA500'
  },
  {
     key: 'thornShroom',
     label: 'Thornshroom',
     labelKey: 'thornShroom',
     icon: '',
     description: 'Thornshroom',
     category: 'plants',
     iconPath: '/icons/markers/plants/thornshroom.webp',
     color: '#FFA500'
  },
  {
     key: 'darkFloret',
     label: 'Dark Floret',
     labelKey: 'darkFloret',
     icon: '',
     description: 'Dark Floret',
     category: 'plants',
     iconPath: '/icons/markers/plants/dark-floret.webp',
     color: '#FFA500'
  },
  {
     key: 'fireFloret',
     label: 'Fire Floret',
     labelKey: 'fireFloret',
     icon: '',
     description: 'Fire Floret',
     category: 'plants',
     iconPath: '/icons/markers/plants/fire-floret.webp',
     color: '#FFA500'
  },
  {
     key: 'natureFloret',
     label: 'Nature Floret',
     labelKey: 'natureFloret',
     icon: '',
     description: 'Nature Floret',
     category: 'plants',
     iconPath: '/icons/markers/plants/nature-floret.webp',
     color: '#FFA500'
  },
  {
     key: 'iceFloret',
     label: 'Ice Floret',
     labelKey: 'iceFloret',
     icon: '',
     description: 'Ice Floret',
     category: 'plants',
     iconPath: '/icons/markers/plants/ice-floret.webp',
     color: '#FFA500'
  },
  {
     key: 'lightFloret',
     label: 'Light Floret',
     labelKey: 'lightFloret',
     icon: '',
     description: 'Light Floret',
     category: 'plants',
     iconPath: '/icons/markers/plants/light-floret.webp',
     color: '#FFA500'
  },
  {
     key: 'lightningFloret',
     label: 'Lightning Floret',
     labelKey: 'lightningFloret',
     icon: '',
     description: 'Lightning Floret',
     category: 'plants',
     iconPath: '/icons/markers/plants/lightning-floret.webp',
     color: '#FFA500'
  },
  {
     key: 'herb',
     label: 'Herb',
     labelKey: 'herbs',
     icon: '',
     description: 'Herb',
     category: 'plants',
     iconPath: '/icons/markers/plants/herb.webp',
     color: '#FFA500'
  },
  {
     key: 'wheat',
     label: 'Wheat',
     labelKey: 'wheat',       
     icon: '',
     description: 'Wheat',
     category: 'plants',       
     iconPath: '/icons/markers/plants/wheat.webp',
     color: '#FFA500'
  },
  {
     key: 'lemon',
     label: 'Lemon',
     labelKey: 'lemon',       
     icon: '',
     description: 'Lemon',
     category: 'plants',       
     iconPath: '/icons/markers/plants/lemon.webp',
     color: '#FFA500'
  },
  {
     key: 'orange',
     label: 'Orange',
     labelKey: 'orange',       
     icon: '',
     description: 'Orange',
     category: 'plants',       
     iconPath: '/icons/markers/plants/orange.webp',
     color: '#FFA500'
  },
  {
     key: 'pumpkin',
     label: 'Pumpkin',
     labelKey: 'pumpkin',       
     icon: '',
     description: 'Pumpkin',
     category: 'plants',       
     iconPath: '/icons/markers/plants/pumpkin.webp',
     color: '#FFA500'
  },
  {
     key: 'tomato',
     label: 'Tomato',
     labelKey: 'tomato',       
     icon: '',
     description: 'Tomato',
     category: 'plants',       
     iconPath: '/icons/markers/plants/tomato.webp',
     color: '#FFA500'
  },
   {
     key: 'silk',
     label: 'Silk',
     labelKey: 'silk',       
     icon: '',
     description: 'Silk',
     category: 'plants',       
     iconPath: '/icons/markers/plants/silk.webp',
     color: '#FFA500'
  },
  {
     key: 'cotton',
     label: 'Cotton',
     labelKey: 'cotton',       // chave i18n minúscula
     icon: '',
     description: 'Cotton',
     category: 'plants',       // categoria nova 'herbs'
     iconPath: '/icons/markers/plants/cotton.webp',
     color: '#FFA500'
  },

  // LEATHER =============================================
  
  {
     key: 'thickHide',
     label: 'Thick Hide',
     labelKey: 'thickHide',
     icon: '',
     description: 'Thick Hide',
     category: 'leather',
     iconPath: '/icons/markers/leather/thick-hide.webp',
     color: '#FFA500'
   },
  
  
  
  // ORES =============================================
  
  {
     key: 'platinumOre',
     label: 'Platinum Ore',
     labelKey: 'platinumOre',
     icon: '',
     description: 'Platinum Ore',
     category: 'ores',
     iconPath: '/icons/markers/ores/platinum-ore.webp',
     color: '#FFA500'
   },
  {
     key: 'goldOre',
     label: 'Gold Ore',
     labelKey: 'goldOre',
     icon: '',
     description: 'Gold Ore',
     category: 'ores',
     iconPath: '/icons/markers/ores/gold-ore.webp',
     color: '#FFA500'
   },
  {
     key: 'silverOre',
     label: 'Silver Ore',
     labelKey: 'silverOre',
     icon: '',
     description: 'Silver Ore',
     category: 'ores',
     iconPath: '/icons/markers/ores/silver-ore.webp',
     color: '#FFA500'
   },
  {
     key: 'meteoriteOre',
     label: 'Meteorite Ore',
     labelKey: 'meteoriteOre',
     icon: '',
     description: 'Meteorite Ore',
     category: 'ores',
     iconPath: '/icons/markers/ores/meteorite-ore.webp',
     color: '#FFA500'
   },
  {
     key: 'archeOre',
     label: 'Arche Ore',
     labelKey: 'archeOre',
     icon: '',
     description: 'Arche Ore',
     category: 'ores',
     iconPath: '/icons/markers/ores/arche-ore.webp',
     color: '#FFA500'
   },
  {
     key: 'ironOre',
     label: 'Iron Ore',
     labelKey: 'ironOre',
     icon: '',
     description: 'Iron Ore',
     category: 'ores',
     iconPath: '/icons/markers/ores/iron-ore.webp',
     color: '#FFA500'
   },
  {
     key: 'lightningCrystal',
     label: 'Lightning Crystal',
     labelKey: 'lightningCrystal',
     icon: '',
     description: 'Lightning Crystal',
     category: 'ores',
     iconPath: '/icons/markers/ores/lightning-crystal.webp',
     color: '#FFA500'
   },
  {
     key: 'lightCrystal',
     label: 'Light Crystal',
     labelKey: 'lightCrystal',
     icon: '',
     description: 'Light Crystal',
     category: 'ores',
     iconPath: '/icons/markers/ores/light-crystal.webp',
     color: '#FFA500'
   },
  {
     key: 'darkCrystal',
     label: 'Dark Crystal',
     labelKey: 'darkCrystal',
     icon: '',
     description: 'Dark Crystal',
     category: 'ores',
     iconPath: '/icons/markers/ores/dark-crystal.webp',
     color: '#FFA500'
   },
  {
     key: 'iceCrystal',
     label: 'Ice Crystal',
     labelKey: 'iceCrystal',
     icon: '',
     description: 'Ice Crystal',
     category: 'ores',
     iconPath: '/icons/markers/ores/ice-crystal.webp',
     color: '#FFA500'
   },
  {
     key: 'natureCrystal',
     label: 'Nature Crystal',
     labelKey: 'natureCrystal',
     icon: '',
     description: 'Nature Crystal',
     category: 'ores',
     iconPath: '/icons/markers/ores/nature-crystal.webp',
     color: '#FFA500'
   },
  {
     key: 'fireCrystal',
     label: 'Fire Crystal',
     labelKey: 'fireCrystal',
     icon: '',
     description: 'Fire Crystal',
     category: 'ores',
     iconPath: '/icons/markers/ores/fire-crystal.webp',
     color: '#FFA500'
   },

  // 🦌 ANIMALS =================================================
  // {
  //   key: 'lion',
  //   label: 'Lion',
  //   labelKey: 'lion',
  //   icon: '',
  //   description: 'Lion',
  //   category: 'animals',
  //   iconPath: '/icons/markers/animals/lion.png',
  //   color: '#FFA500'
  // },

  // MISSIONS =============================================

  {
     key: 'bountyBoard',
     label: 'Bounty Board',
     labelKey: 'bountyBoard',       
     icon: '',
     description: 'BountyBoard',
     category: 'cities',       
     iconPath: '/icons/markers/cities/bounty-board.webp',
     color: '#FFA500'
  },
  {
    key: 'worldQuest',
    label: 'World Quest',
    labelKey: 'worldQuest',
    icon: '',
    description: 'World Quest',
    category: 'missions',
    iconPath: '/icons/markers/missions/world-quest.png',
    color: '#8B0000'
  },
  {
    key: 'bountyHunter',
    label: 'Bounty Hunter',
    labelKey: 'bountyHunter',
    icon: '',
    description: 'Bounty Hunter',
    category: 'missions',
    iconPath: '/icons/markers/missions/bounty-hunter.webp',
    color: '#8B0000'
  },
  {
    key: 'chronoGate',
    label: 'Chrono Gate',
    labelKey: 'chronoGate',
    icon: '',
    description: 'Chrono Gate',
    category: 'missions',
    iconPath: '/icons/markers/missions/chrono-gate.webp',
    color: '#2F4F4F'
  },
	{
    key: 'quests',
    label: 'Quests',
    labelKey: 'quests',
    icon: '',
    description: 'Quests',
    category: 'missions',
    iconPath: '/icons/markers/missions/quest.webp',
    color: '#FFD700'
  	},
  

  // EVENTS =============================================
  {
    key: 'dynamicEvents',
    label: 'Dynanmic Events',
    labelKey: 'dynamicEvents',
    icon: '',
    description: 'Dynanmic Events',
    category: 'events',
    iconPath: '/icons/markers/events/dynamic-events.png',
    color: '#8B0000'
  },
  {
    key: 'voidNexus',
    label: 'Void Nexus',
    labelKey: 'voidNexus',
    icon: '',
    description: 'Void Nexus',
    category: 'events',
    iconPath: '/icons/markers/events/void-nexus.webp',
    color: '#2F4F4F'
  },
  {
    key: 'openWorld',
    label: 'Open World',
    labelKey: 'openWorld',
    icon: '',
    description: 'Open World',
    category: 'events',
    iconPath: '/icons/markers/events/open-world.png',
    color: '#FFD700'
  },
  

  // ENEMIES ============================================================

  {
    key: 'fieldBoss',
    label: 'Field Boss',
    labelKey: 'fieldBoss',
    icon: '',
    description: 'Field Boss',
    category: 'enemies',
    iconPath: '/icons/markers/enemies/field-boss.webp',
    color: '#8B0000'
  },
  {
    key: 'regionBoss',
    label: 'Region Boss',
    labelKey: 'regionBoss',
    icon: '',
    description: 'Region Boss',
    category: 'enemies',
    iconPath: '/icons/markers/enemies/region-boss.webp',
    color: '#8B0000'
  },
  
  
  // CHESTS =============================================
  
  {
    key: 'chestElite',
    label: 'Chest Elite',
    labelKey: 'chestElite',
    icon: '',
    description: 'Chest Elite',
    category: 'chests',
    iconPath: '/icons/markers/chests/chest-elite.webp',
    color: '#8A2BE2'
  },
  {
    key: 'foodChest',
    label: 'Food Chest',
    labelKey: 'foodChest',
    icon: '',
    description: 'Food Chest',
    category: 'chests',
    iconPath: '/icons/markers/chests/food-chest.webp',
    color: '#8A2BE2'
  },
  {
    key: 'alchemyChest',
    label: 'Alchemy Chest',
    labelKey: 'alchemyChest',
    icon: '',
    description: 'alchemy Chest',
    category: 'chests',
    iconPath: '/icons/markers/chests/alchemy-chest.webp',
    color: '#8A2BE2'
  },
  {
    key: 'elitejewelChest',
    label: 'Elite Jewel Chest',
    labelKey: 'eliteJewelChest',
    icon: '',
    description: 'Elite Jewel Chest',
    category: 'chests',
    iconPath: '/icons/markers/chests/elite-jewel-chest.webp',
    color: '#8A2BE2'
  },
  {
    key: 'chest',
    label: 'Chest',
    labelKey: 'chest',
    icon: '',
    description: 'Chest',
    category: 'chests',
    iconPath: '/icons/markers/chests/chest.webp',
    color: '#8A2BE2'
  },

  // NPCS =============================================
  
  {
    key: 'olivia',
    label: 'Olivia',
    labelKey: 'olivia',
    icon: '',
    description: 'Olivia',
    category: 'npcs',
    iconPath: '/icons/markers/npc/npc.webp',
    color: '#8A2BE2'
  },

  // STRUCTURES =============================================
  
  {
    key: 'beaconOfTime',
    label: 'beacon Of Time',
    labelKey: 'beaconOfTime',
    icon: '',
    description: 'beacon Of Time',
    category: 'structures',
    iconPath: '/icons/markers/structures/beacon-of-time.webp',
    color: '#8A2BE2'
  },
  {
    key: 'eyeOfInsight',
    label: 'Eye of Insight',
    labelKey: 'eyeOfInsight',
    icon: '',
    description: 'Eye of Insight',
    category: 'structures',
    iconPath: '/icons/markers/structures/eyeofinsight.webp',
    color: '#8A2BE2'
  },
  {
    key: 'boundStone',
    label: 'Bound Stone',
    labelKey: 'boundStone',
    icon: '',
    description: 'Bound Stone',
    category: 'structures',
    iconPath: '/icons/markers/structures/bound-stone.webp',
    color: '#8A2BE2'
  },
  {
    key: 'timePortals',
    label: 'Time Portals',
    labelKey: 'timePortals',
    icon: '',
    description: 'Time Portals',
    category: 'structures',
    iconPath: '/icons/markers/structures/time-portals.webp',
    color: '#8A2BE2'
  },
  {
    key: 'dungeon',
    label: 'Dungeon',
    labelKey: 'dungeon',
    icon: '',
    description: 'Dungeon',
    category: 'structures',
    iconPath: '/icons/markers/structures/dungeon.webp',
    color: '#2F4F4F'
  },
  {
    key: 'labyrinth',
    label: 'Labyrinth',
    labelKey: 'labyrinth',
    icon: '',
    description: 'Labyrinth',
    category: 'structures',
    iconPath: '/icons/markers/structures/labyrinth.webp',
    color: '#FFA500'
  },
  {
    key: 'trials',
    label: 'Trial',
    labelKey: 'trial',
    icon: '',
    description: 'Trial',
    category: 'structures',
    iconPath: '/icons/markers/structures/trials.webp',
    color: '#2F4F4F'
  },
  {
    key: 'pit',
    label: 'Pit',
    labelKey: 'pit',
    icon: '',
    description: 'Pit',
    category: 'structures',
    iconPath: '/icons/markers/structures/pit.webp',
    color: '#2F4F4F'
  },
  {
    key: 'sword',
    label: 'Sword',
    labelKey: 'sword',
    icon: '',
    description: 'Sword',
    category: 'structures',
    iconPath: '/icons/markers/structures/sword.webp',
    color: '#8B0000'
  },
  {
    key: 'pvp',
    label: 'PvP',
    labelKey: 'pvp',
    icon: '',
    description: 'PvP',
    category: 'structures',
    iconPath: '/icons/markers/structures/pvp.webp',
    color: '#8B0000'
  },

  // 🏙️ CIDADE ===============================================

  {
    key: 'alchemy',
    label: 'Alchemy',
    labelKey: 'alchemy',
    icon: '',
    description: 'Alchemy',
    category: 'cities',
    iconPath: '/icons/markers/cities/alchemy.webp',
    color: '#8A2BE2'
  },
  {
    key: 'cooking',
    label: 'Cooking',
    labelKey: 'cooking',
    icon: '',
    description: 'Cooking',
    category: 'cities',
    iconPath: '/icons/markers/cities/cooking.webp',
    color: '#8A2BE2'
  },
  {
    key: 'salvage',
    label: 'Salvage',
    labelKey: 'salvage',
    icon: '',
    description: 'Salvage',
    category: 'cities',
    iconPath: '/icons/markers/cities/salvage.webp',
    color: '#FFA500'
  },
  {
    key: 'forge',
    label: 'Forge',
    labelKey: 'forge',
    icon: '',
    description: 'Forge',
    category: 'cities',
    iconPath: '/icons/markers/cities/forge.webp',
    color: '#FFA500'
  },
  {
    key: 'generalGoods',
    label: 'General Goods',
    labelKey: 'generalGoods',
    icon: '',
    description: 'General Goods',
    category: 'cities',
    iconPath: '/icons/markers/cities/general-goods.webp',
    color: '#FFA500'
  },
  {
    key: 'jewelry',
    label: 'Jewelry',
    labelKey: 'jewelry',
    icon: '',
    description: 'Jewelry',
    category: 'cities',
    iconPath: '/icons/markers/cities/jewelry.webp',
    color: '#FFA500'
  },
  {
    key: 'transfer',
    label: 'Transfer',
    labelKey: 'transfer',
    icon: '',
    description: 'Transfer',
    category: 'cities',
    iconPath: '/icons/markers/cities/transfer.webp',
    color: '#FFA500'
  },
  {
    key: 'armorer',
    label: 'Armorer',
    labelKey: 'armorer',
    icon: '',
    description: 'Armorer',
    category: 'cities',
    iconPath: '/icons/markers/cities/armorer.webp',
    color: '#FFA500'
  },
  {
    key: 'enchanter',
    label: 'Enchanter',
    labelKey: 'enchanter',
    icon: '',
    description: 'Enchanter',
    category: 'cities',
    iconPath: '/icons/markers/cities/enchanter.webp',
    color: '#FFA500'
  },
  {
    key: 'armorCrafting',
    label: 'Armor Crafting',
    labelKey: 'armorCrafting',
    icon: '',
    description: 'Armor Crafting',
    category: 'cities',
    iconPath: '/icons/markers/cities/armor-crafting.webp',
    color: '#FFA500'
  },
  {
    key: 'processing',
    label: 'Processing',
    labelKey: 'processing',
    icon: '',
    description: 'Processing',
    category: 'cities',
    iconPath: '/icons/markers/cities/processing.webp',
    color: '#FFA500'
  },
  {
    key: 'tradingPost',
    label: 'Trading Post',
    labelKey: 'tradingPost',
    icon: '',
    description: 'Trading Post',
    category: 'cities',
    iconPath: '/icons/markers/cities/trading-post.webp',
    color: '#FFA500'
  },
  {
    key: 'warehouse',
    label: 'Warehouse',
    labelKey: 'warehouse',
    icon: '',
    description: 'Warehouse',
    category: 'cities',
    iconPath: '/icons/markers/cities/warehouse.webp',
    color: '#FFA500'
  },
  {
    key: 'inn',
    label: 'Inn',
    labelKey: 'inn',
    icon: '',
    description: 'Inn',
    category: 'cities',
    iconPath: '/icons/markers/cities/inn.webp',
    color: '#FFA500'
  },
  {
    key: 'stableKeeper',
    label: 'Stable Keeper',
    labelKey: 'stableKeeper',
    icon: '',
    description: 'StableKeeper',
    category: 'cities',
    iconPath: '/icons/markers/cities/stable-keeper.webp',
    color: '#8A2BE2'
  },
];

// ===================================================================
//  FUNÇÕES AUXILIARES (NÃO MEXER)
// ===================================================================
// Cria objeto que organiza tipos por categoria para o popup
export const getMarkersByCategory = () => {
  const categories = {
    plants: { name: 'Plants', types: [] as MarkerType[] },
    herbs: { name: 'Herbs', types: [] as MarkerType[] },     
    animals: { name: 'Animals', types: [] as MarkerType[] },
    ores: { name: 'Ores', types: [] as MarkerType[] },
    leather: { name: 'Leather', types: [] as MarkerType[] },
    enemies: { name: 'Enemies', types: [] as MarkerType[] },
    npcs: { name: 'NPCs', types: [] as MarkerType[] },
    structures: { name: 'Structures', types: [] as MarkerType[] },
    cities: { name: 'Cities', types: [] as MarkerType[] },
    missions: { name: 'Missions', types: [] as MarkerType[] },
    events: { name: 'Events', types: [] as MarkerType[] },
    chests: { name: 'Chests', types: [] as MarkerType[] },    // << categoria adicionada
	woods: { name: 'Woods', types: [] as MarkerType[] },	// << categoria adicionada
  };

  MARKER_TYPES.forEach(type => {
    if (categories[type.category as keyof typeof categories]) {
      categories[type.category as keyof typeof categories].types.push(type);
    } else {
      console.warn(`Categoria '${type.category}' não existe para o tipo '${type.key}'`);
    }
  });

  return categories;
};

// Cria objeto de filtros inicial
export const createInitialFilters = () => {
  const filters: { [key: string]: boolean } = {};
  MARKER_TYPES.forEach(type => {
    filters[type.key] = true;
  });
  return filters;
};

// Pega tipo por chave
export const getMarkerType = (key: string): MarkerType | undefined => {
  return MARKER_TYPES.find(type => type.key === key);
};
