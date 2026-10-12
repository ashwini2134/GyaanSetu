const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const branding = await prisma.branding.findFirst();
  console.log("BEFORE:");
  console.log(JSON.stringify(branding, null, 2));
  
  if (branding) {
    const updated = await prisma.branding.update({
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
