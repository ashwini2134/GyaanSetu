const fs = require('fs');
const path = require('path');

function processDir(dirName, relativePathToPrisma) {
  const dir = path.join(process.cwd(), dirName);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

  files.forEach(f => {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    if (content.includes('import { PrismaClient } from "@prisma/client";')) {
      content = content.replace(/import \{ PrismaClient \} from "@prisma\/client";\r?\n/g, '');
      changed = true;
    }
    if (content.includes('const prisma = new PrismaClient();')) {
      content = content.replace(/const prisma = new PrismaClient\(\);/g, 'import { prisma } from "' + relativePathToPrisma + '";');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
    }
  });
}

processDir('src/workers', '../../prisma.js');
processDir('src/lib', '../prisma.js');
processDir('src/cron', '../prisma.js');
