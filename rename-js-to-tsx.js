import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('src');

function hasJSX(content) {
  // Verifica presença básica de JSX (tags HTML/React)
  return /<[\w]+.*>/.test(content);
}

function renameFilesRecursively(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      renameFilesRecursively(fullPath);
    } else {
      const ext = path.extname(file);
      if ((ext === '.ts' || ext === '.js') && !file.endsWith('.d.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (hasJSX(content)) {
          const newFullPath = fullPath.replace(ext, '.tsx');
          fs.renameSync(fullPath, newFullPath);
          console.log(`Renomeado: ${fullPath} → ${newFullPath}`);
        }
      }
    }
  }
}

renameFilesRecursively(SRC_DIR);
console.log('Renomeação concluída!');
