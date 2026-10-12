import jwt from 'jsonwebtoken';
import { prisma } from './src/prisma.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production-32chars';

async function testRoutes() {
  // First find or create an admin user
  let admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'testadmin@example.com',
        name: 'Test Admin',
        passwordHash: 'dummy',
        role: 'admin'
      }
    });
  }

  // Generate token
  const token = jwt.sign(
    { sub: admin.id, role: admin.role, email: admin.email, name: admin.name, type: "access" },
    JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  console.log(`\n\n=== RUNNING ROUTE TEST ===`);
  console.log("Token generated for Admin:", admin.email);

  // We need to start the backend or simulate a fetch to the running backend.
  // Assuming the backend is running on port 3001
  try {
    const res = await fetch('http://localhost:3001/api/admin/content-assessments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "Test Assessment",
        category: "Programming",
        subsection: "React",
        description: "A test assessment for the routes",
        isPublished: true
      })
    });
    
    if (!res.ok) {
        console.error(`Request failed with status ${res.status}`);
        console.error(await res.text());
        return;
    }

    const data = await res.json();
    console.log("SUCCESS! Created Assessment:");
    console.log(JSON.stringify(data, null, 2));
    console.log(`==========================\n\n`);
  } catch (err) {
    console.error("Could not connect to backend. Make sure it's running on port 3001.");
  }
}

testRoutes()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
