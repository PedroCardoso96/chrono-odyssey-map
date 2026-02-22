import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportMarkers() {
  const markers = await prisma.marker.findMany();
  fs.writeFileSync('prisma/markers_backup.json', JSON.stringify(markers, null, 2));
  console.log(`${markers.length} marcações exportadas para prisma/markers_backup.json`);
}

exportMarkers().finally(() => prisma.$disconnect());