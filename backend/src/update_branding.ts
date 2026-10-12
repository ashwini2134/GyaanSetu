import { prisma } from './prisma.js';

async function main() {
  const branding = await prisma.brandingSettings.findFirst();
  console.log("BEFORE:");
  console.log(JSON.stringify(branding, null, 2));
  
  if (branding) {
    const updated = await prisma.brandingSettings.update({
      where: { id: branding.id },
      data: { primaryColor: '#00BFB3' }
    });
    console.log("AFTER:");
    console.log(JSON.stringify(updated, null, 2));
  } else {
    console.log("No branding record found.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
