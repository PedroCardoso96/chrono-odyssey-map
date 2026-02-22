// Salve este arquivo como: prisma/updateMarkerTypes.ts
import { PrismaClient } from '@prisma/client';
// A importação abaixo assume que o arquivo markersConfig.ts está em 'src/config/'
// O '.js' no final é necessário por causa da sua configuração do TypeScript (module: "NodeNext")
import { MARKER_TYPES } from '../src/config/markersConfig.js';

const prisma = new PrismaClient();

// ===================================================================
// MAPEAMENTO DE CHAVES (DE-PARA)
// ===================================================================
// Mapeia os nomes ANTIGOS dos tipos de marcadores (como estão no DB)
// para os NOVOS nomes em camelCase (como estão no seu markersConfig.ts).
const KEY_MAPPING: Record<string, string> = {
  // Mapeamento gerado a partir da sua lista de marcadores
  'eye of insight': 'eyeOfInsight',
  'worldquest': 'worldQuest',
  'bountyhunter': 'bountyHunter',
  'boundstone': 'boundStone',
  'fieldboss': 'fieldBoss',
  'regionboss': 'regionBoss',
  'timeportals': 'timePortals',
  'general goods': 'generalGoods',
  'armor crafting': 'armorCrafting',
  'tradingpost': 'tradingPost',
  'stablekeeber': 'stableKeeper',
  'ironore': 'ironOre',
  'silverore': 'silverOre',
  'meteoriteore': 'meteoriteOre',
  'firecrystal': 'fireCrystal',
  'archeore': 'archeOre',
  'darkcrystal': 'darkCrystal',
  'icecrystal': 'iceCrystal',
  'naturecrystal': 'natureCrystal',
  'lightcrystal': 'lightCrystal',
  'lightningcrystal': 'lightningCrystal',
  'void nexus': 'voidNexus',
  'chestelite': 'chestElite',
  'elitejewelchest': 'eliteJewelChest',
  'foodchest': 'foodChest',
  'alchemychest': 'alchemyChest',
  'darkfloret': 'darkFloret',
  'firefloret': 'fireFloret',
  'icefloret': 'iceFloret',
  'lightfloret': 'lightFloret',
  'lightningfloret': 'lightningFloret',
  'naturefloret': 'natureFloret',
  
  // <-- MARCADORES ADICIONADOS/CORRIGIDOS
  'platinumore': 'platinumOre',
  'goldore': 'goldOre',
  'thornshroom': 'thornShroom',
  'earthshroom': 'earthShroom',
  'ghostshroom': 'ghostShroom',
  'mistshroom': 'mistShroom',
  'oxshroom': 'oxShroom',
  'shieldshroom': 'shieldShroom',
  'chronogate' : 'chronoGate',
};

async function migrateMarkerTypes() {
  console.log('Iniciando a migração dos tipos de marcadores...');

  // 1. Busca todos os marcadores do banco de dados
  const allMarkers = await prisma.marker.findMany();
  console.log(`Encontrados ${allMarkers.length} marcadores para verificar.`);

  let updatedCount = 0;
  const updatePromises = [];

  for (const marker of allMarkers) {
    // 2. Verifica se o tipo atual do marcador precisa ser mapeado
    const newType = KEY_MAPPING[marker.type];

    if (newType) {
      // 3. Se um novo tipo for encontrado no mapeamento, prepara a atualização
      console.log(`- Atualizando marcador ID ${marker.id}: de "${marker.type}" para "${newType}"`);
      
      const updatePromise = prisma.marker.update({
        where: { id: marker.id },
        data: { type: newType },
      });
      
      updatePromises.push(updatePromise);
      updatedCount++;
    }
  }

  if (updatePromises.length > 0) {
    // 4. Executa todas as atualizações no banco de dados de uma vez
    await Promise.all(updatePromises);
    console.log(`\n✅ Migração concluída! ${updatedCount} marcadores foram atualizados.`);
  } else {
    console.log('\n✅ Nenhum marcador precisou de atualização. Os dados já estão consistentes.');
  }
}

migrateMarkerTypes()
  .catch((e) => {
    console.error('Ocorreu um erro durante a migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
