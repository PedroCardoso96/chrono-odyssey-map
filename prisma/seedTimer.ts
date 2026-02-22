// prisma/seedTimers.js
import { PrismaClient } from '@prisma/client';
// A importação abaixo assume que o arquivo markersConfig.ts foi compilado para dist/src/config/
// O '.js' no final é necessário.
import { MARKER_TYPES } from '../src/config/markersConfig.js';

const prisma = new PrismaClient();

// ===================================================================
// CONFIGURAÇÃO DOS TIMERS
// ===================================================================

const TYPE_SPECIFIC_RESPAWN_TIMES = {
  'bountyHunter': 600,   // 10 minutos
  'fieldBoss': 18000,  // 5 horas
  'regionBoss': 28800, // 8 horas
};

const CATEGORY_RESPAWN_TIMES = {
  'ores': 180,     // 3 minutos
  'plants': 180,   // 3 minutos
  'chests': 3600,  // 1 hora
  'events': 7200,  // 2 horas
  'default': 3600,
};

const ELIGIBLE_CATEGORIES = ['ores', 'plants', 'chests', 'events'];
const ELIGIBLE_TYPES = ['bountyHunter', 'fieldBoss', 'regionBoss']; 

// ===================================================================
// LÓGICA DO SCRIPT
// ===================================================================

async function createEligibleTimers() {
  console.log('Iniciando o processo de criação de timers para marcadores elegíveis...');

  const markers = await prisma.marker.findMany({
    where: { status: 'approved' },
  });

  console.log(`Encontrados ${markers.length} marcadores aprovados para verificação.`);
  let timersCriados = 0;

  for (const marker of markers) {
    const markerType = MARKER_TYPES.find(mt => mt.key === marker.type);

    if (!markerType) {
      console.warn(`- Pulando marcador ID ${marker.id}: tipo "${marker.type}" não encontrado no config.`);
      continue;
    }

    const isEligibleByCategory = ELIGIBLE_CATEGORIES.includes(markerType.category);
    const isEligibleByType = ELIGIBLE_TYPES.includes(marker.type);

    if (!isEligibleByCategory && !isEligibleByType) {
      continue;
    }

    const existingTimer = await prisma.respawnTimer.findUnique({
      where: { entityId: String(marker.id) },
    });

    if (existingTimer) {
      continue;
    }

    // Linha 68: Adicione o 'as keyof typeof ...'
const baseRespawnSeconds = 
  TYPE_SPECIFIC_RESPAWN_TIMES[marker.type as keyof typeof TYPE_SPECIFIC_RESPAWN_TIMES] || 
  
// Linha 69: Faça o mesmo aqui
  CATEGORY_RESPAWN_TIMES[markerType.category as keyof typeof CATEGORY_RESPAWN_TIMES] || 
  CATEGORY_RESPAWN_TIMES['default'];
      
    const now = new Date();
    
    await prisma.respawnTimer.create({
      data: {
        entityId: String(marker.id),
        entityName: marker.label,
        category: markerType.category,
        location: marker.label,
        lat: marker.lat,
        lng: marker.lng,
        baseRespawnSeconds: baseRespawnSeconds,
        lastKilledAt: now,
        nextRespawnAt: new Date(now.getTime() + baseRespawnSeconds * 1000),
        isActive: true,
        isPremium: true,
        mapSection: 'Setera', // Placeholder
        icon: markerType.iconPath,
      },
    });

    timersCriados++;
    console.log(`+ Timer criado para: ${marker.label} (ID: ${marker.id}) com respawn de ${baseRespawnSeconds / 60} minutos.`);
  }

  console.log(`\n✅ Processo finalizado. ${timersCriados} novos timers foram criados.`);
}

createEligibleTimers()
  .catch((e) => {
    console.error('Ocorreu um erro durante a criação dos timers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
