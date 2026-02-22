// prisma/cronUpdateTimers.ts

import { PrismaClient } from '@prisma/client';
// Importa o MARKER_TYPES do seu config, ajustando o caminho relativo à pasta prisma/
// Verifique se o seu markersConfig.js compilado está em 'dist/config'
import { MARKER_TYPES } from '../src/config/markersConfig.js'; 

const prisma = new PrismaClient();

// ===================================================================
// CONFIGURAÇÃO DOS TIMERS (COPIADA DO SEED)
// ===================================================================

const TYPE_SPECIFIC_RESPAWN_TIMES: Record<string, number> = {
  'bountyHunter': 660,     // 11 minutos
  'fieldBoss': 330,    // 5 minutos e meio
  'regionBoss': 135,  //  2 minutos e 15
};

const CATEGORY_RESPAWN_TIMES: Record<string, number> = {
  'ores': 180,         // 3 minutos
  'plants': 180,       // 3 minutos
  'chests': 3600,      // 1 hora (mantido como padrão)
  'events': 7200,      // 2 horas (mantido como padrão)
  'default': 3600,     // Valor padrão
};

const ELIGIBLE_CATEGORIES = ['ores', 'plants', 'chests', 'events'];
const ELIGIBLE_TYPES = ['bountyHunter', 'fieldBoss', 'regionBoss']; 

// ===================================================================
// LÓGICA DO SCRIPT DE CRON JOB
// ===================================================================

async function cronUpdateTimers() { 
  const now = new Date();
  console.log(`[${now.toLocaleString('pt-BR')}] Iniciando verificação e atualização de timers expirados (CRON JOB - .ts direto)...`);

  try {
    const expiredTimers = await prisma.respawnTimer.findMany({
      where: {
        nextRespawnAt: {
          lte: now,
        },
        // Filtra por elegibilidade usando as definições
        OR: [
          { category: { in: ELIGIBLE_CATEGORIES } },
          { entityName: { in: ELIGIBLE_TYPES } } 
        ],
        isActive: true, // Apenas timers ativos
      },
    });

    if (expiredTimers.length === 0) {
      console.log(`[${now.toLocaleString('pt-BR')}] Nenhum timer expirado elegível encontrado.`);
      return;
    }

    console.log(`[${now.toLocaleString('pt-BR')}] Encontrados ${expiredTimers.length} timers expirados elegíveis. Atualizando...`);

    const updatePromises = expiredTimers.map(async (timer) => {
      // Re-determina o tempo de respawn base para garantir que está usando as definições atuais
      // Nota: MARKER_TYPES.find pode precisar de ajuste se timer.entityName não for igual a marker.key
      const markerTypeConfig = MARKER_TYPES.find(mt => mt.key === timer.entityName.toLowerCase().replace(/ /g, '')); 

      let baseRespawnSeconds = 
        TYPE_SPECIFIC_RESPAWN_TIMES[timer.entityName.toLowerCase()] || 
        (markerTypeConfig ? CATEGORY_RESPAWN_TIMES[markerTypeConfig.category] : undefined) ||
        CATEGORY_RESPAWN_TIMES[timer.category] || 
        CATEGORY_RESPAWN_TIMES['default'];

      if (baseRespawnSeconds === undefined || baseRespawnSeconds <= 0) {
          baseRespawnSeconds = timer.baseRespawnSeconds; 
      }

      let newNextRespawnAt = new Date(timer.nextRespawnAt.getTime() + baseRespawnSeconds * 1000);

      // Garante que o newNextRespawnAt seja sempre no futuro em relação ao 'agora'
      while (newNextRespawnAt.getTime() < now.getTime()) {
        newNextRespawnAt = new Date(newNextRespawnAt.getTime() + baseRespawnSeconds * 1000);
      }

      const randomSecondsJitter = Math.floor(Math.random() * 60);
      newNextRespawnAt = new Date(newNextRespawnAt.getTime() + randomSecondsJitter * 1000);

      await prisma.respawnTimer.update({
        where: { id: timer.id },
        data: {
          nextRespawnAt: newNextRespawnAt,
        },
      });
    });

    await Promise.all(updatePromises);
    console.log(`[${now.toLocaleString('pt-BR')}] ✅ ${expiredTimers.length} timers expirados foram atualizados com sucesso.`);

  } catch (error) {
    console.error(`[${now.toLocaleString('pt-BR')}] ❌ Erro ao atualizar timers no cron:`, error);
  } finally {
    await prisma.$disconnect(); 
  }
}

// Executa a função principal
cronUpdateTimers();