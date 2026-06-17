import Database from "better-sqlite3";

const db = new Database("./data/lms.db");
const rows = db.prepare("SELECT id, email, name, role, created_at FROM user").all();
console.table(rows);
const allTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables:", allTables.map((r: any) => r.name));
db.close();
