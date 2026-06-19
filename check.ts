import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:amazon@localhost:5432/fraylon_lms";
const pool = new Pool({ connectionString });

async function run() {
  try {
    const res = await pool.query("SELECT COUNT(*) FROM assessment_progress");
    console.log('Count:', res.rows[0].count);
  } catch (e: any) {
    console.error('Table error:', e.message);
  }

  try {
    const res2 = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'assessment_progress'
    `);
    console.log('Columns:', res2.rows);
  } catch (e: any) {
    console.error('Schema error:', e.message);
  }

  await pool.end();
}

run();
