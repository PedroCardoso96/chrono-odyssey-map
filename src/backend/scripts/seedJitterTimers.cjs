// src/backend/scripts/seedJitterTimers.cjs (agora funcionando para criar E atualizar)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===================================================================
// 🛠️ FUNÇÕES E EXCEÇÕES DE CONVERSÃO
// ===================================================================

const camelCaseExceptions = {
  'ghostshroom': 'ghostShroom', 'shieldshroom': 'shieldShroom',
  'thornshroom': 'thornShroom', 'oxshroom': 'oxShroom',
  'earthshroom': 'earthShroom', 'mistshroom': 'mistShroom',
  'herb': 'herbs', 'redwood': 'redWood',
};

const toCamelCase = (str) => {
  if (!str) return '';
  const lowerCaseStr = str.toLowerCase();
  if (camelCaseExceptions[lowerCaseStr]) {
    return camelCaseExceptions[lowerCaseStr];
  }
  return lowerCaseStr.replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '');
};

// ===================================================================
// 🕒 CONFIGURAÇÃO DOS RESPAWN TIMERS
// ===================================================================

const TYPE_SPECIFIC_RESPAWN_TIMES = {
  'bountyHunter': 660, 'fieldBoss': 330, 'regionBoss': 135,
};
const CATEGORY_RESPAWN_TIMES = {
  'ores': 180, 'plants': 180, 'woods': 180, 'chests': 3600, 'events': 7200, 'default': 3600,
};
const ELIGIBLE_CATEGORIES = ['ores', 'plants', 'chests', 'events', 'leather', 'woods'];
const ELIGIBLE_TYPES = ['bountyHunter', 'fieldBoss', 'regionBoss'];

// ===================================================================
// 🎯 DADOS DOS MARCADORES
// ===================================================================
const MARKER_TYPES = [
	//  WOODS =============================================
    { key: 'archeWood', label: 'Arche Wood', labelKey: 'archeWood', icon: '', description: 'archeWood', category: 'woods', iconPath: '/icons/markers/woods/arche-wood.webp', color: '#FFA500' },
	{ key: 'redWood', label: 'Red Wood', labelKey: 'redWood', icon: '', description: 'redWood', category: 'woods', iconPath: '/icons/markers/woods/red-wood.webp', color: '#FFA500' },
    //  PLANTS =============================================
    { key: 'earthShroom', label: 'Earthshroom', labelKey: 'earthShroom', icon: '', description: 'Earthshroom', category: 'plants', iconPath: '/icons/markers/plants/earthshroom.webp', color: '#FFA500' },
    { key: 'ghostShroom', label: 'Ghostshroom', labelKey: 'ghostShroom', icon: '', description: 'Ghostshroom', category: 'plants', iconPath: '/icons/markers/plants/ghostshroom.webp', color: '#FFA500' },
    { key: 'mistShroom', label: 'Mistshroom', labelKey: 'mistShroom', icon: '', description: 'Misthroom', category: 'plants', iconPath: '/icons/markers/plants/mistshroom.webp', color: '#FFA500' },
    { key: 'oxShroom', label: 'Oxshroom', labelKey: 'oxShroom', icon: '', description: 'Oxshroom', category: 'plants', iconPath: '/icons/markers/plants/oxshroom.webp', color: '#FFA500' },
    { key: 'shieldShroom', label: 'Shieldshroom', labelKey: 'shieldShroom', icon: '', description: 'Shieldshroom', category: 'plants', iconPath: '/icons/markers/plants/shieldshroom.webp', color: '#FFA500' },
    { key: 'thornShroom', label: 'Thornshroom', labelKey: 'thornShroom', icon: '', description: 'Thornshroom', category: 'plants', iconPath: '/icons/markers/plants/thornshroom.webp', color: '#FFA500' },
    { key: 'darkFloret', label: 'Dark Floret', labelKey: 'darkFloret', icon: '', description: 'Dark Floret', category: 'plants', iconPath: '/icons/markers/plants/dark-floret.webp', color: '#FFA500' },
    { key: 'fireFloret', label: 'Fire Floret', labelKey: 'fireFloret', icon: '', description: 'Fire Floret', category: 'plants', iconPath: '/icons/markers/plants/fire-floret.webp', color: '#FFA500' },
    { key: 'natureFloret', label: 'Nature Floret', labelKey: 'natureFloret', icon: '', description: 'Nature Floret', category: 'plants', iconPath: '/icons/markers/plants/nature-floret.webp', color: '#FFA500' },
    { key: 'iceFloret', label: 'Ice Floret', labelKey: 'iceFloret', icon: '', description: 'Ice Floret', category: 'plants', iconPath: '/icons/markers/plants/ice-floret.webp', color: '#FFA500' },
    { key: 'lightFloret', label: 'Light Floret', labelKey: 'lightFloret', icon: '', description: 'Light Floret', category: 'plants', iconPath: '/icons/markers/plants/light-floret.webp', color: '#FFA500' },
    { key: 'lightningFloret', label: 'Lightning Floret', labelKey: 'lightningFloret', icon: '', description: 'Lightning Floret', category: 'plants', iconPath: '/icons/markers/plants/lightning-floret.webp', color: '#FFA500' },
    { key: 'herb', label: 'Herb', labelKey: 'herbs', icon: '', description: 'Herb', category: 'plants', iconPath: '/icons/markers/plants/herb.webp', color: '#FFA500' },
    { key: 'wheat', label: 'Wheat', labelKey: 'wheat', icon: '', description: 'Wheat', category: 'plants', iconPath: '/icons/markers/plants/wheat.webp', color: '#FFA500' },
    { key: 'lemon', label: 'Lemon', labelKey: 'lemon', icon: '', description: 'Lemon', category: 'plants', iconPath: '/icons/markers/plants/lemon.webp', color: '#FFA500' },
    { key: 'orange', label: 'Orange', labelKey: 'orange', icon: '', description: 'Orange', category: 'plants', iconPath: '/icons/markers/plants/orange.webp', color: '#FFA500' },
    { key: 'pumpkin', label: 'Pumpkin', labelKey: 'pumpkin', icon: '', description: 'Pumpkin', category: 'plants', iconPath: '/icons/markers/plants/pumpkin.webp', color: '#FFA500' },
    { key: 'tomato', label: 'Tomato', labelKey: 'tomato', icon: '', description: 'Tomato', category: 'plants', iconPath: '/icons/markers/plants/tomato.webp', color: '#FFA500' },
    { key: 'silk', label: 'Silk', labelKey: 'silk', icon: '', description: 'Silk', category: 'plants', iconPath: '/icons/markers/plants/silk.webp', color: '#FFA500' },
    { key: 'cotton', label: 'Cotton', labelKey: 'cotton', icon: '', description: 'Cotton', category: 'plants', iconPath: '/icons/markers/plants/cotton.webp', color: '#FFA500' },
    // LEATHER =============================================
    { key: 'thickHide', label: 'Thick Hide', labelKey: 'thickHide', icon: '', description: 'Thick Hide', category: 'leather', iconPath: '/icons/markers/leather/thick-hide.webp', color: '#FFA500' },
    // ORES =============================================
    { key: 'platinumOre', label: 'Platinum Ore', labelKey: 'platinumOre', icon: '', description: 'Platinum Ore', category: 'ores', iconPath: '/icons/markers/ores/platinum-ore.webp', color: '#FFA500' },
    { key: 'goldOre', label: 'Gold Ore', labelKey: 'goldOre', icon: '', description: 'Gold Ore', category: 'ores', iconPath: '/icons/markers/ores/gold-ore.webp', color: '#FFA500' },
    { key: 'silverOre', label: 'Silver Ore', labelKey: 'silverOre', icon: '', description: 'Silver Ore', category: 'ores', iconPath: '/icons/markers/ores/silver-ore.webp', color: '#FFA500' },
    { key: 'meteoriteOre', label: 'Meteorite Ore', labelKey: 'meteoriteOre', icon: '', description: 'Meteorite Ore', category: 'ores', iconPath: '/icons/markers/ores/meteorite-ore.webp', color: '#FFA500' },
    { key: 'archeOre', label: 'Arche Ore', labelKey: 'archeOre', icon: '', description: 'Arche Ore', category: 'ores', iconPath: '/icons/markers/ores/arche-ore.webp', color: '#FFA500' },
    { key: 'ironOre', label: 'Iron Ore', labelKey: 'ironOre', icon: '', description: 'Iron Ore', category: 'ores', iconPath: '/icons/markers/ores/iron-ore.webp', color: '#FFA500' },
    { key: 'lightningCrystal', label: 'Lightning Crystal', labelKey: 'lightningCrystal', icon: '', description: 'Lightning Crystal', category: 'ores', iconPath: '/icons/markers/ores/lightning-crystal.webp', color: '#FFA500' },
    { key: 'lightCrystal', label: 'Light Crystal', labelKey: 'lightCrystal', icon: '', description: 'Light Crystal', category: 'ores', iconPath: '/icons/markers/ores/light-crystal.webp', color: '#FFA500' },
    { key: 'darkCrystal', label: 'Dark Crystal', labelKey: 'darkCrystal', icon: '', description: 'Dark Crystal', category: 'ores', iconPath: '/icons/markers/ores/dark-crystal.webp', color: '#FFA500' },
    { key: 'iceCrystal', label: 'Ice Crystal', labelKey: 'iceCrystal', icon: '', description: 'Ice Crystal', category: 'ores', iconPath: '/icons/markers/ores/ice-crystal.webp', color: '#FFA500' },
    { key: 'natureCrystal', label: 'Nature Crystal', labelKey: 'natureCrystal', icon: '', description: 'Nature Crystal', category: 'ores', iconPath: '/icons/markers/ores/nature-crystal.webp', color: '#FFA500' },
    { key: 'fireCrystal', label: 'Fire Crystal', labelKey: 'fireCrystal', icon: '', description: 'Fire Crystal', category: 'ores', iconPath: '/icons/markers/ores/fire-crystal.webp', color: '#FFA500' },
    // MISSIONS =============================================
    { key: 'bountyBoard', label: 'Bounty Board', labelKey: 'bountyBoard', icon: '', description: 'BountyBoard', category: 'cities', iconPath: '/icons/markers/cities/bounty-board.webp', color: '#FFA500' },
    { key: 'worldQuest', label: 'World Quest', labelKey: 'worldQuest', icon: '', description: 'World Quest', category: 'missions', iconPath: '/icons/markers/missions/world-quest.png', color: '#8B0000' },
    { key: 'bountyHunter', label: 'Bounty Hunter', labelKey: 'bountyHunter', icon: '', description: 'Bounty Hunter', category: 'missions', iconPath: '/icons/markers/missions/bounty-hunter.webp', color: '#8B0000' },
    { key: 'chronoGate', label: 'Chrono Gate', labelKey: 'chronoGate', icon: '', description: 'Chrono Gate', category: 'missions', iconPath: '/icons/markers/missions/chrono-gate.webp', color: '#2F4F4F' },
    { key: 'quests', label: 'Quests', labelKey: 'quests', icon: '', description: 'Quests', category: 'missions', iconPath: '/icons/markers/missions/quest.webp', color: '#FFD700' },
    // EVENTS =============================================
    { key: 'dynamicEvents', label: 'Dynanmic Events', labelKey: 'dynamicEvents', icon: '', description: 'Dynanmic Events', category: 'events', iconPath: '/icons/markers/events/dynamic-events.png', color: '#8B0000' },
    { key: 'voidNexus', label: 'Void Nexus', labelKey: 'voidNexus', icon: '', description: 'Void Nexus', category: 'events', iconPath: '/icons/markers/events/void-nexus.webp', color: '#2F4F4F' },
    { key: 'openWorld', label: 'Open World', labelKey: 'openWorld', icon: '', description: 'Open World', category: 'events', iconPath: '/icons/markers/events/open-world.png', color: '#FFD700' },
    // ENEMIES
    { key: 'fieldBoss', label: 'Field Boss', labelKey: 'fieldBoss', icon: '', description: 'Field Boss', category: 'enemies', iconPath: '/icons/markers/enemies/field-boss.webp', color: '#8B0000' },
    { key: 'regionBoss', label: 'Region Boss', labelKey: 'regionBoss', icon: '', description: 'Region Boss', category: 'enemies', iconPath: '/icons/markers/enemies/region-boss.webp', color: '#8B0000' },
    // CHESTS =============================================
    { key: 'chestElite', label: 'Chest Elite', labelKey: 'chestElite', icon: '', description: 'Chest Elite', category: 'chests', iconPath: '/icons/markers/chests/chest-elite.webp', color: '#8A2BE2' },
    { key: 'foodChest', label: 'Food Chest', labelKey: 'foodChest', icon: '', description: 'Food Chest', category: 'chests', iconPath: '/icons/markers/chests/food-chest.webp', color: '#8A2BE2' },
    { key: 'alchemyChest', label: 'Alchemy Chest', labelKey: 'alchemyChest', icon: '', description: 'alchemy Chest', category: 'chests', iconPath: '/icons/markers/chests/alchemy-chest.webp', color: '#8A2BE2' },
    { key: 'elitejewelChest', label: 'Elite Jewel Chest', labelKey: 'eliteJewelChest', icon: '', description: 'Elite Jewel Chest', category: 'chests', iconPath: '/icons/markers/chests/elite-jewel-chest.webp', color: '#8A2BE2' },
    { key: 'chest', label: 'Chest', labelKey: 'chest', icon: '', description: 'Chest', category: 'chests', iconPath: '/icons/markers/chests/chest.webp', color: '#8A2BE2' },
    // NPCS =============================================
    { key: 'olivia', label: 'Olivia', labelKey: 'olivia', icon: '', description: 'Olivia', category: 'npcs', iconPath: '/icons/markers/npc/npc.webp', color: '#8A2BE2' },
    // STRUCTURES =============================================
    { key: 'eyeOfInsight', label: 'Eye of Insight', labelKey: 'eyeOfInsight', icon: '', description: 'Eye of Insight', category: 'structures', iconPath: '/icons/markers/structures/eyeofinsight.webp', color: '#8A2BE2' },
    { key: 'boundStone', label: 'Bound Stone', labelKey: 'boundStone', icon: '', description: 'Bound Stone', category: 'structures', iconPath: '/icons/markers/structures/bound-stone.webp', color: '#8A2BE2' },
    { key: 'timePortals', label: 'Time Portals', labelKey: 'timePortals', icon: '', description: 'Time Portals', category: 'structures', iconPath: '/icons/markers/structures/time-portals.webp', color: '#8A2BE2' },
    { key: 'dungeon', label: 'Dungeon', labelKey: 'dungeon', icon: '', description: 'Dungeon', category: 'structures', iconPath: '/icons/markers/structures/dungeon.webp', color: '#2F4F4F' },
    { key: 'labyrinth', label: 'Labyrinth', labelKey: 'labyrinth', icon: '', description: 'Labyrinth', category: 'structures', iconPath: '/icons/markers/structures/labyrinth.webp', color: '#FFA500' },
    { key: 'trials', label: 'Trial', labelKey: 'trial', icon: '', description: 'Trial', category: 'structures', iconPath: '/icons/markers/structures/trials.webp', color: '#2F4F4F' },
    { key: 'pit', label: 'Pit', labelKey: 'pit', icon: '', description: 'Pit', category: 'structures', iconPath: '/icons/markers/structures/pit.webp', color: '#2F4F4F' },
    { key: 'sword', label: 'Sword', labelKey: 'sword', icon: '', description: 'Sword', category: 'structures', iconPath: '/icons/markers/structures/sword.webp', color: '#8B0000' },
    { key: 'pvp', label: 'PvP', labelKey: 'pvp', icon: '', description: 'PvP', category: 'structures', iconPath: '/icons/markers/structures/pvp.webp', color: '#8B0000' },
    // 🏙️ CIDADE ===============================================
    { key: 'alchemy', label: 'Alchemy', labelKey: 'alchemy', icon: '', description: 'Alchemy', category: 'cities', iconPath: '/icons/markers/cities/alchemy.webp', color: '#8A2BE2' },
    { key: 'cooking', label: 'Cooking', labelKey: 'cooking', icon: '', description: 'Cooking', category: 'cities', iconPath: '/icons/markers/cities/cooking.webp', color: '#8A2BE2' },
    { key: 'salvage', label: 'Salvage', labelKey: 'salvage', icon: '', description: 'Salvage', category: 'cities', iconPath: '/icons/markers/cities/salvage.webp', color: '#FFA500' },
    { key: 'forge', label: 'Forge', labelKey: 'forge', icon: '', description: 'Forge', category: 'cities', iconPath: '/icons/markers/cities/forge.webp', color: '#FFA500' },
    { key: 'generalGoods', label: 'General Goods', labelKey: 'generalGoods', icon: '', description: 'General Goods', category: 'cities', iconPath: '/icons/markers/cities/general-goods.webp', color: '#FFA500' },
    { key: 'jewelry', label: 'Jewelry', labelKey: 'jewelry', icon: '', description: 'Jewelry', category: 'cities', iconPath: '/icons/markers/cities/jewelry.webp', color: '#FFA500' },
    { key: 'transfer', label: 'Transfer', labelKey: 'transfer', icon: '', description: 'Transfer', category: 'cities', iconPath: '/icons/markers/cities/transfer.webp', color: '#FFA500' },
    { key: 'armorer', label: 'Armorer', labelKey: 'armorer', icon: '', description: 'Armorer', category: 'cities', iconPath: '/icons/markers/cities/armorer.webp', color: '#FFA500' },
    { key: 'enchanter', label: 'Enchanter', labelKey: 'enchanter', icon: '', description: 'Enchanter', category: 'cities', iconPath: '/icons/markers/cities/enchanter.webp', color: '#FFA500' },
    { key: 'armorCrafting', label: 'Armor Crafting', labelKey: 'armorCrafting', icon: '', description: 'Armor Crafting', category: 'cities', iconPath: '/icons/markers/cities/armor-crafting.webp', color: '#FFA500' },
    { key: 'processing', label: 'Processing', labelKey: 'processing', icon: '', description: 'Processing', category: 'cities', iconPath: '/icons/markers/cities/processing.webp', color: '#FFA500' },
    { key: 'tradingPost', label: 'Trading Post', labelKey: 'tradingPost', icon: '', description: 'Trading Post', category: 'cities', iconPath: '/icons/markers/cities/trading-post.webp', color: '#FFA500' },
    { key: 'warehouse', label: 'Warehouse', labelKey: 'warehouse', icon: '', description: 'Warehouse', category: 'cities', iconPath: '/icons/markers/cities/warehouse.webp', color: '#FFA500' },
    { key: 'inn', label: 'Inn', labelKey: 'inn', icon: '', description: 'Inn', category: 'cities', iconPath: '/icons/markers/cities/inn.webp', color: '#FFA500' },
    { key: 'stableKeeper', label: 'Stable Keeper', labelKey: 'stableKeeper', icon: '', description: 'StableKeeper', category: 'cities', iconPath: '/icons/markers/cities/stable-keeper.webp', color: '#8A2BE2' },
];

const getRespawnTime = (markerType) => {
  if (!markerType) return CATEGORY_RESPAWN_TIMES['default'];
  if (TYPE_SPECIFIC_RESPAWN_TIMES[markerType.key]) {
    return TYPE_SPECIFIC_RESPAWN_TIMES[markerType.key];
  }
  return CATEGORY_RESPAWN_TIMES[markerType.category] || CATEGORY_RESPAWN_TIMES['default'];
};


// ===================================================================
// ⚙️ LÓGICA DE SINCRONIZAÇÃO E ATUALIZAÇÃO (NÃO DESTRUTIVA)
// ===================================================================

async function main() {
  console.log('Iniciando Sincronização e Atualização de RespawnTimers...');

  const allMarkers = await prisma.marker.findMany();
  const existingTimers = await prisma.respawnTimer.findMany();
  console.log(`Encontrados ${allMarkers.length} marcadores e ${existingTimers.length} timers existentes.`);

  const existingTimersMap = new Map(existingTimers.map(t => [t.entityId, t]));
  const markerTypeMap = new Map(MARKER_TYPES.map(mt => [mt.key, mt]));
  
  const timersToCreate = [];
  const timersToUpdate = [];
  const now = new Date();

  for (const marker of allMarkers) {
    const markerIdStr = marker.id.toString();
    const existingTimer = existingTimersMap.get(markerIdStr);
    const markerTypeDetails = markerTypeMap.get(marker.type);

    if (!markerTypeDetails) continue;

    const isEligible = ELIGIBLE_CATEGORIES.includes(markerTypeDetails.category) || ELIGIBLE_TYPES.includes(markerTypeDetails.key);
    
    if (isEligible) {
      const newEntityName = toCamelCase(marker.label);

      if (existingTimer) {
        if (existingTimer.entityName !== newEntityName) {
          timersToUpdate.push({
            id: existingTimer.id,
            entityName: newEntityName,
          });
        }
      } else {
        const respawnTimeInSeconds = getRespawnTime(markerTypeDetails);
        const nextRespawnDate = new Date(now.getTime() + respawnTimeInSeconds * 1000);

        timersToCreate.push({
          entityId:           markerIdStr,
          entityName:         newEntityName,
          category:           markerTypeDetails.category,
          icon:               markerTypeDetails.iconPath,
          baseRespawnSeconds: respawnTimeInSeconds,
          location:           `(${marker.lat.toFixed(2)}, ${marker.lng.toFixed(2)})`,
          lat:                marker.lat,
          lng:                marker.lng,
          nextRespawnAt:      nextRespawnDate,
          isActive:           true,
          isPremium:          true,
        });
      }
    }
  }

  if (timersToCreate.length > 0) {
    await prisma.respawnTimer.createMany({
      data: timersToCreate,
    });
    console.log(`✅ ${timersToCreate.length} novos timers foram criados.`);
  }

  if (timersToUpdate.length > 0) {
    console.log(`Atualizando ${timersToUpdate.length} timers com nomes personalizados...`);
    for (const timerData of timersToUpdate) {
      await prisma.respawnTimer.update({
        where: { id: timerData.id },
        data: { entityName: timerData.entityName },
      });
    }
    console.log(`✅ ${timersToUpdate.length} timers foram atualizados com sucesso.`);
  }
  
  if (timersToCreate.length === 0 && timersToUpdate.length === 0) {
    console.log('Nenhuma criação ou atualização necessária. O banco já está sincronizado.');
  }
  
  const allMarkerIds = new Set(allMarkers.map(m => m.id.toString()));
  const orphanedTimerIds = existingTimers
    .filter(timer => !allMarkerIds.has(timer.entityId))
    .map(timer => timer.id);

  if (orphanedTimerIds.length > 0) {
    await prisma.respawnTimer.deleteMany({
        where: { id: { in: orphanedTimerIds } }
    });
    console.log(`🗑️ ${orphanedTimerIds.length} timers órfãos foram removidos.`);
  }

  console.log('Sincronização concluída!');
}

main()
  .catch(e => {
    console.error('❌ Erro durante a sincronização:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Conexão com o banco de dados finalizada.');
  });
