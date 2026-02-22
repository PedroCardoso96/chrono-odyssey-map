// scripts/setupAdminAndMarkers.ts
// Salve este arquivo na pasta 'scripts/' dentro da raiz do seu projeto.
import { PrismaClient } from '@prisma/client';
// Não precisamos de uuidv4 aqui, pois o Prisma @default(cuid()) já cuida.

const prisma = new PrismaClient();

async function main() {
  // 1. INFORMAÇÕES CRÍTICAS DO SEU USUÁRIO ADMIN ANTIGO
  //    COLOQUE AQUI O NOME COMPLETO DO SEU USUÁRIO ADMIN!
  const ADMIN_NAME = "Chrono Odyssey"; // <-- NÃO ESQUEÇA DE PREENCHER ESTA LINHA!
  const ADMIN_EMAIL = "odysseychrono@gmail.com";
  const OLD_ADMIN_GOOGLE_ID = "118365754076596121457";

  // --- Passo 2: Deletar o usuário admin antigo (se ainda existir e não foi resetado) ---
  // Isso garantirá que os marcadores órfãos serão null por causa do onDelete:SetNull
  // Se o banco já foi resetado/usuários apagados, este passo não fará nada ou dará um erro "not found" (o que é ok).
  try {
    await prisma.user.delete({
      where: { email: ADMIN_EMAIL }, // Deleta pelo email para ter certeza
    });
    console.log(`[Script] Usuário admin antigo (${ADMIN_EMAIL}) deletado (marcadores agora são null).`);
  } catch (e: any) {
    if (e.code === 'P2025' && e.message.includes('Record to delete does not exist')) {
      console.log(`[Script] Usuário admin antigo (${ADMIN_EMAIL}) não encontrado, prosseguindo.`);
    } else {
      console.warn(`[Script] Aviso/Erro inesperado ao tentar deletar usuário admin antigo: ${e.message}`);
    }
  }

  // --- Passo 3: Criar o NOVO Usuário Admin ---
  // O ID interno (cuid) será gerado automaticamente.
  const newAdminUser = await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      isAdmin: true,
      isPremium: true, // Assumindo que o admin também é Premium
      // 'id' será gerado automaticamente pelo @default(cuid())
    },
  });
  console.log(`[Script] NOVO Usuário Admin criado com ID interno: ${newAdminUser.id}`);

  // --- Passo 4: Criar o registro de Account (Google) para o NOVO Usuário Admin ---
  await prisma.account.create({
    data: {
      userId: newAdminUser.id,           // FK para o ID interno do novo Admin
      provider: "google",                 // Provedor Google
      providerAccountId: OLD_ADMIN_GOOGLE_ID, // Armazena o ID Google original do Admin aqui
      // Você pode adicionar outros campos como access_token, refresh_token se os coletou no login
    },
  });
  console.log(`[Script] Conta Google (${OLD_ADMIN_GOOGLE_ID}) vinculada ao novo Usuário Admin.`);

  // --- Passo 5: Reassociar os Marcadores ---
  // Esta é a parte que conecta os marcadores "órfãos" ao novo usuário Admin.
  // Como o deleteAllUsers.ts já rodou, todos os marcadores devem ter authorId: null.
  const updatedMarkers = await prisma.marker.updateMany({
    where: {
      authorId: null, // Seleciona todos os marcadores que ficaram sem autor
    },
    data: {
      authorId: newAdminUser.id, // Define o authorId para o ID do novo Admin
    },
  });
  console.log(`[Script] Reassociados ${updatedMarkers.count} marcadores ao novo Usuário Admin.`);

}

main()
  .catch((e) => {
    console.error('Erro no script de migração do Admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });