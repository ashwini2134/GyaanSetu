import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fraylon_lms' });
  await client.connect();
  await client.query('DELETE FROM project_submissions');
  await client.end();
  console.log('Cleared project_submissions');
}
run().catch(console.error);
