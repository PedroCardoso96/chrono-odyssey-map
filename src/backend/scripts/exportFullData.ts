import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportFullData() {
  const data = {
    users: await prisma.user.findMany(),
    accounts: await prisma.account.findMany(),
    posts: await prisma.post.findMany(),
    markers: await prisma.marker.findMany(),
    respawnTimers: await prisma.respawnTimer.findMany(),
  };

  fs.writeFileSync('prisma/full_backup.json', JSON.stringify(data, null, 2));
  console.log("✅ Backup completo gerado em prisma/full_backup.json");
}

exportFullData().finally(() => prisma.$disconnect());