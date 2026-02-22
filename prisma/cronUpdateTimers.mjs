// prisma/cronUpdateTimers.mjs (Versão JavaScript Pura)

import { PrismaClient } from '@prisma/client';
import { MARKER_TYPES } from '../dist/config/markersConfig.js'; // Caminho OK
// import * as fs from 'fs'; // Remover se não estiver usando o log de heartbeat

const prisma = new PrismaClient();

// ===================================================================
// CONFIGURAÇÃO DOS TIMERS (COPIADA DO SEED)
// ===================================================================

const TYPE_SPECIFIC_RESPAWN_TIMES = {
  'bountyHunter': 660,     // 11 minutos
  'fieldBoss': 330,    // 5 minutos e meio
  'regionBoss': 135,  //  2 minutos e 15
};

const CATEGORY_RESPAWN_TIMES = {
  'ores': 180,         // 3 minutos
  'plants': 180,       // 3 minutos
  'chests': 3600,      // 1 hora (mantido como padrão)
  'events': 7200,      // 2 horas (mantido como padrão)
  'default': 3600,     // Valor padrão
};

const ELIGIBLE_CATEGORIES = ['ores', 'plants', 'chests', 'events'];
const ELIGIBLE_TYPES = ['bountyHunter', 'fieldBoss', 'regionBoss']; 

const ELIGIBLE_LABELS_FOR_TYPES = ELIGIBLE_TYPES.map(typeKey => {
    const foundMarkerType = MARKER_TYPES.find(mt => mt.key === typeKey);
    return foundMarkerType ? foundMarkerType.label : typeKey.toUpperCase().replace(/([A-Z])([A-Z]+)/g, '$1 $2').trim(); 
});

const convertLabelToTypeKey = (label) => {
    if (!label) return '';
    const parts = label.toLowerCase().split(' ');
    if (parts.length === 1) return parts[0];
    return parts[0] + parts.slice(1).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
};


async function runCronJob() {
  const now = new Date();
  console.log(`[${now.toLocaleString('pt-BR')}] Iniciando verificação e atualização de timers expirados (CRON JOB - .js puro)...`);

  try {
    const expiredTimers = await prisma.respawnTimer.findMany({
      where: {
        nextRespawnAt: {
          lte: now,
        },
        isActive: true, 
      },
    });

    if (expiredTimers.length === 0) {
      console.log(`[${now.toLocaleString('pt-BR')}] Nenhum timer expirado elegível encontrado.`);
      return;
    }

    console.log(`[${now.toLocaleString('pt-BR')}] Encontrados ${expiredTimers.length} timers expirados elegíveis. Atualizando...`);

    const updatePromises = expiredTimers.map(async (timer) => {
      const timerEntityKey = convertLabelToTypeKey(timer.entityName); 

      // CORREÇÃO AQUI: Converter mt.label para UPPERCASE antes da comparação
      const markerTypeConfig = MARKER_TYPES.find(mt => mt.label.toUpperCase() === timer.entityName); 
      
      let baseRespawnSeconds = 
        TYPE_SPECIFIC_RESPAWN_TIMES[timerEntityKey] || 
        (markerTypeConfig ? CATEGORY_RESPAWN_TIMES[markerTypeConfig.category] : undefined) ||
        CATEGORY_RESPAWN_TIMES[timer.category] || 
        CATEGORY_RESPAWN_TIMES['default'];

      if (baseRespawnSeconds === undefined || baseRespawnSeconds <= 0) {
          baseRespawnSeconds = timer.baseRespawnSeconds; 
      }

      let newNextRespawnAt = new Date(timer.nextRespawnAt.getTime() + baseRespawnSeconds * 1000);

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

runCronJob();