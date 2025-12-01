// scripts/deleteAllUsers.ts
// Salve este arquivo na pasta 'scripts/' dentro da raiz do seu projeto.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando a exclusão de todos os usuários...');
  try {
    // Exclui todos os registros da tabela User
    // Graças ao 'onDelete: SetNull' no modelo Marker, os marcadores não serão apagados,
    // apenas seu authorId será definido como null.
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Sucesso! Excluídos ${deletedUsers.count} usuários.`);
  } catch (e: any) {
    console.error('Erro ao excluir usuários:', e);
    // Este erro só ocorreria se a relação onDelete: SetNull não estivesse configurada corretamente,
    // o que já verificamos que está. Ou se houver outro modelo ainda em onDelete: Cascade.
    console.error('Por favor, verifique se todas as relações do User para outros modelos têm onDelete: SetNull.');
  } finally {
    await prisma.$disconnect();
  }
}

main();