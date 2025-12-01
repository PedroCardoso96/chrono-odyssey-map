// src/backend/workers/timerWorker.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateTimersLogic() {
  console.log(`[${new Date().toLocaleString()}] Iniciando verificação e atualização de timers expirados...`);

  try {
    const now = new Date();

    const expiredTimers = await prisma.respawnTimer.findMany({
      where: {
        nextRespawnAt: {
          lt: now,
        },
        isActive: true,
      },
    });

    if (expiredTimers.length === 0) {
      console.log(`[${new Date().toLocaleString()}] Nenhum timer expirado encontrado.`);
      return;
    }

    console.log(`[${new Date().toLocaleString()}] Encontrados ${expiredTimers.length} timers expirados. Atualizando...`);

    let updatedCount = 0;
    for (const timer of expiredTimers) {
      let newNextRespawnAt = new Date(timer.nextRespawnAt.getTime() + timer.baseRespawnSeconds * 1000);

      // Garante que o próximo respawn esteja no futuro, mesmo se o worker atrasar
      while (newNextRespawnAt.getTime() < now.getTime()) {
        newNextRespawnAt = new Date(newNextRespawnAt.getTime() + timer.baseRespawnSeconds * 1000);
      }

      // === NOVO: Adiciona um jitter aleatório em segundos a CADA ATUALIZAÇÃO ===
      // Isso garantirá que mesmo timers que não tinham jitter inicial se desincronizem.
      const randomSecondsJitter = Math.floor(Math.random() * 60); // 0 a 59 segundos
      newNextRespawnAt = new Date(newNextRespawnAt.getTime() + randomSecondsJitter * 1000);
      // =======================================================================

      await prisma.respawnTimer.update({
        where: { id: timer.id },
        data: {
          lastKilledAt: now,
          nextRespawnAt: newNextRespawnAt,
        },
      });
      updatedCount++;
      // Removida a mensagem de log individual para cada timer atualizado.
      // Se você precisar depurar um timer específico, pode reativar temporariamente.
      // console.log(`[${new Date().toLocaleString()}] - Timer "${timer.entityName}" (ID: ${timer.entityId}) atualizado para: ${newNextRespawnAt.toLocaleString()}`);
    }

    console.log(`[${new Date().toLocaleString()}] ✅ ${updatedCount} timers expirados foram atualizados com sucesso.`);

  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] ❌ Erro ao atualizar timers expirados:`, error);
  }
}

const INTERVAL_SECONDS = 30;
const INTERVAL_MS = INTERVAL_SECONDS * 1000;

console.log(`Iniciando Timer Worker. Executando a lógica a cada ${INTERVAL_SECONDS} segundos.`);

updateTimersLogic();
setInterval(updateTimersLogic, INTERVAL_MS);

process.on('SIGINT', async () => {
  console.log('Timer Worker recebido SIGINT. Desconectando Prisma...');
  await prisma.$disconnect();
  console.log('Prisma desconectado. Encerrando Timer Worker.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Timer Worker recebido SIGTERM. Desconectando Prisma...');
  await prisma.$disconnect();
  console.log('Prisma desconectado. Encerrando Timer Worker.');
  process.exit(0);
});