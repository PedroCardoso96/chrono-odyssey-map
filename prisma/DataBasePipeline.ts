import { PrismaClient } from '@prisma/client';
import fs from 'fs';
// Assumindo que MARKER_TYPES já está centralizado aqui
import { MARKER_TYPES } from '../src/config/markersConfig.js';

const prisma = new PrismaClient();
const ADMIN_ID = 'cmlyi04yy00003ervoojhj771';

// ===================================================================
// 🛠️ FUNÇÕES E EXCEÇÕES DE CONVERSÃO (Herdado do seedJitterTimers)
// ===================================================================
const camelCaseExceptions: Record<string, string> = {
  'ghostshroom': 'ghostShroom', 'shieldshroom': 'shieldShroom',
  'thornshroom': 'thornShroom', 'oxshroom': 'oxShroom',
  'earthshroom': 'earthShroom', 'mistshroom': 'mistShroom',
  'herb': 'herbs', 'redwood': 'redWood',
};

const toCamelCase = (str: string | undefined): string => {
  if (!str) return '';
  const lowerCaseStr = str.toLowerCase();
  if (camelCaseExceptions[lowerCaseStr]) return camelCaseExceptions[lowerCaseStr];
  return lowerCaseStr.replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '');
};

// ===================================================================
// 🕒 CONFIGURAÇÕES DE RESPAWN
// ===================================================================
const TYPE_SPECIFIC_RESPAWN_TIMES: Record<string, number> = {
  'bountyHunter': 660, 'fieldBoss': 330, 'regionBoss': 135,
};
const CATEGORY_RESPAWN_TIMES: Record<string, number> = {
  'ores': 180, 'plants': 180, 'woods': 180, 'chests': 3600, 'events': 7200, 'default': 3600,
};
const ELIGIBLE_CATEGORIES = ['ores', 'plants', 'chests', 'events', 'leather', 'woods'];
const ELIGIBLE_TYPES = ['bountyHunter', 'fieldBoss', 'regionBoss'];

// Higienização de tipos para o Banco (updateMarkerTypes)
const KEY_MAPPING: Record<string, string> = {
  'elitejewelChest': 'eliteJewelChest', 'ironore': 'ironOre', 'silverore': 'silverOre',
  'platinumore': 'platinumOre', 'goldore': 'goldOre', 'chronogate': 'chronoGate'
};

async function runPipeline() {
  console.log("🚀 Iniciando DataBasePipeline Consolidado...");

  // 1. ADMIN & BACKUP (Omissão de log para brevidade, mas lógica mantida)
  await prisma.user.upsert({
    where: { id: ADMIN_ID },
    update: { isAdmin: true },
    create: { id: ADMIN_ID, email: process.env.ADMIN_EMAIL || "admin@chronoodyssey.com.br", name: "Chrono Odyssey", isAdmin: true }
  });

  if (fs.existsSync('prisma/full_backup.json')) {
    const backup = JSON.parse(fs.readFileSync('prisma/full_backup.json', 'utf-8'));
    for (const u of backup.users) await prisma.user.upsert({ where: { id: u.id }, update: u, create: u });
    for (const m of backup.markers) await prisma.marker.upsert({ where: { id: m.id }, update: m, create: m });
  }

  // 2. HIGIENIZAÇÃO DE TIPOS E AUTORIA
  const allMarkers = await prisma.marker.findMany();
  for (const marker of allMarkers) {
    const newType = KEY_MAPPING[marker.type];
    if (newType || !marker.authorId) {
      await prisma.marker.update({
        where: { id: marker.id },
        data: { type: newType || marker.type, authorId: marker.authorId || ADMIN_ID }
      });
    }
  }

  // 3. SINCRONIZAÇÃO DE TIMERS (Lógica completa do seedJitterTimers)
  const existingTimers = await prisma.respawnTimer.findMany();
  const existingTimersMap = new Map(existingTimers.map(t => [t.entityId, t]));
  const markerTypeMap = new Map(MARKER_TYPES.map(mt => [mt.key, mt]));
  
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
        // Se o nome mudou (ex: renomeou no admin), atualiza o timer
        if (existingTimer.entityName !== newEntityName) {
          await prisma.respawnTimer.update({
            where: { id: existingTimer.id },
            data: { entityName: newEntityName }
          });
        }
      } else {
        // Cria novo timer com a lógica de tempo correta
        const respawnSeconds = TYPE_SPECIFIC_RESPAWN_TIMES[markerTypeDetails.key] || 
                               CATEGORY_RESPAWN_TIMES[markerTypeDetails.category] || 
                               CATEGORY_RESPAWN_TIMES['default'];

        await prisma.respawnTimer.create({
          data: {
            entityId: markerIdStr,
            entityName: newEntityName,
            category: markerTypeDetails.category,
            icon: markerTypeDetails.iconPath,
            baseRespawnSeconds: respawnSeconds,
            location: `(${marker.lat.toFixed(2)}, ${marker.lng.toFixed(2)})`,
            lat: marker.lat,
            lng: marker.lng,
            nextRespawnAt: new Date(now.getTime() + respawnSeconds * 1000),
            isActive: true,
            isPremium: true
          }
        });
      }
    }
  }

  // 4. LIMPEZA DE ÓRFÃOS
  const allMarkerIds = new Set(allMarkers.map(m => m.id.toString()));
  const orphanedTimerIds = existingTimers.filter(t => !allMarkerIds.has(t.entityId)).map(t => t.id);
  if (orphanedTimerIds.length > 0) {
    await prisma.respawnTimer.deleteMany({ where: { id: { in: orphanedTimerIds } } });
    console.log(`🗑️ ${orphanedTimerIds.length} timers órfãos removidos.`);
  }

  console.log("🏁 Pipeline Finalizado com 100% de paridade de scripts.");
}

runPipeline().catch(console.error).finally(() => prisma.$disconnect());