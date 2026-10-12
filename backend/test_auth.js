import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
const { Client } = pkg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:amazon@localhost:5432/fraylon_lms'
});

async function main() {
  await client.connect();
  const passwordHash = await bcrypt.hash('password123', 12);
  const email = 'beingshanya@gmail.com';
  const role = 'admin';
  const name = 'Admin Shanya';
  
  // Check if user exists
  const res = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);
  if (res.rows.length === 0) {
    await client.query(
      'INSERT INTO "User" (id, email, name, "passwordHash", role, "emailVerified", "status", "profileVisibility", "profileTheme", "updatedAt", "lastActiveAt", "createdAt", bio, "avatarUrl", "githubUrl", "linkedinUrl", "portfolioUrl", "streakFreezeUsedAt", "statsData", "notificationPrefs") VALUES (gen_random_uuid(), $1, $2, $3, $4, true, \'active\', \'public\', \'default\', NOW(), NOW(), NOW(), \'\', \'\', \'\', \'\', \'\', NULL, NULL, NULL)',
      [email, name, passwordHash, role]
    );
    console.log('Created admin user beingshanya@gmail.com with password123');
  } else {
    // Update existing user
    await client.query(
      'UPDATE "User" SET role = $1, "passwordHash" = $2 WHERE email = $3',
      [role, passwordHash, email]
    );
    console.log('Updated user beingshanya@gmail.com to be admin and reset password');
  }
  await client.end();
}

main().catch(console.error);
