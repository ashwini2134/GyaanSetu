require('dotenv').config({path: '../.env'});
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("DB Connection SUCCESS!", user ? "Found user" : "No users yet");
  } catch (e) {
    console.error("DB Connection FAILED!", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
