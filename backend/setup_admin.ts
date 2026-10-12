import { prisma } from './src/prisma.js';
import { hashPassword } from './src/utils/password.js';

async function setupTestAdmin() {
  const email = 'test_only_admin@example.com';
  const password = 'password123';
  const hash = await hashPassword(password);
  
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash }
    });
    console.log(`Updated test admin: ${email} / ${password}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name: 'Test Only Admin',
        passwordHash: hash,
        role: 'admin'
      }
    });
    console.log(`Created test admin: ${email} / ${password}`);
  }
}

setupTestAdmin()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
