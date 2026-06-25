const fs = require('fs');
const path = require('path');

function processDir(dirName) {
  const dir = path.join(process.cwd(), dirName);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

  files.forEach(f => {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    if (content.includes('import { prisma } from "../../prisma.js";')) {
      content = content.replace(/import \{ prisma \} from "\.\.\/\.\.\/prisma\.js";/g, 'import { prisma } from "../prisma.js";');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
    }
  });
}

processDir('src/workers');
