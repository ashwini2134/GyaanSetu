import pkg from 'pg';
const { Client } = pkg;
const client = new Client({
  connectionString: 'postgresql://postgres:amazon@localhost:5432/fraylon_lms'
});
async function main() {
  await client.connect();
  const res = await client.query('SELECT count(*) FROM "Course"');
  console.log('Courses count:', res.rows);
  await client.end();
}
main().catch(console.error);
