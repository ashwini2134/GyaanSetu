const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), 'src/routes/admin');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  if (content.includes('import { PrismaClient } from "@prisma/client";')) {
    content = content.replace('import { PrismaClient } from "@prisma/client";\r\n', '');
    content = content.replace('import { PrismaClient } from "@prisma/client";\n', '');
    changed = true;
  }
  if (content.includes('const prisma = new PrismaClient();')) {
    content = content.replace('const prisma = new PrismaClient();', 'import { prisma } from "../../prisma.js";');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed', f);
  }
});
