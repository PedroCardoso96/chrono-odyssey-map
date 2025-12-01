// src/backend/scripts/reactivate-timers.cjs

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===================================================================
// ⚙️ CONFIGURAÇÃO DA ALEATORIEDADE (JITTER)
// ===================================================================
// Porcentagem de "jitter" para adicionar ao tempo base.
// 0.10 = 10% de variação. Um timer de 180s pode variar entre 162s e 198s.
// Coloque 0 se não quiser nenhuma aleatoriedade.
const JITTER_PERCENTAGE = 0.10;


/**
 * A função principal que busca e reativa os timers expirados.
 */
async function reactivateExpiredTimers() {
  console.log(`[${new Date().toISOString()}] Iniciando verificação de timers expirados...`);

  const now = new Date();
  const expiredTimers = await prisma.respawnTimer.findMany({
    where: {
      nextRespawnAt: {
        lte: now,
      },
      isActive: true,
    },
  });

  if (expiredTimers.length === 0) {
    console.log('Nenhum timer expirado encontrado. Encerrando.');
    return;
  }

  console.log(`Encontrados ${expiredTimers.length} timers expirados para reativar.`);

  const updatePromises = expiredTimers.map(timer => {
    // ✅ LÓGICA DE ALEATORIEDADE (JITTER)
    // 1. Calcula a variação máxima em segundos (ex: 180s * 10% = 18s)
    const maxJitter = timer.baseRespawnSeconds * JITTER_PERCENTAGE;

    // 2. Gera um número aleatório entre -maxJitter e +maxJitter
    const randomJitterSeconds = Math.round((Math.random() * 2 - 1) * maxJitter);

    // 3. Soma o tempo base com a variação aleatória
    const finalRespawnSeconds = timer.baseRespawnSeconds + randomJitterSeconds;

    // Calcula o novo respawn baseado no *último respawn agendado* mais o tempo final com jitter
    const newNextRespawnAt = new Date(
      timer.nextRespawnAt.getTime() + finalRespawnSeconds * 1000
    );

    // Log aprimorado para mostrar a aleatoriedade em ação
    console.log(
      `  - Reativando '${timer.entityName}'. Base: ${timer.baseRespawnSeconds}s, Jitter: ${randomJitterSeconds}s, Final: ${finalRespawnSeconds}s. Novo respawn: ${newNextRespawnAt.toISOString()}`
    );

    return prisma.respawnTimer.update({
      where: { id: timer.id },
      data: { nextRespawnAt: newNextRespawnAt },
    });
  });

  try {
    await Promise.all(updatePromises);
    console.log(`✅ Sucesso! ${expiredTimers.length} timers foram reativados com jitter.`);
  } catch (error) {
    console.error('❌ Erro ao tentar atualizar os timers no banco de dados:', error);
  }
}

// Executa a função
reactivateExpiredTimers()
  .catch(e => {
    console.error('❌ Erro fatal no script de reativação:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });