import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer the repo-level /data folder so DB persists outside backend subfolder
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'nexa.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db; // resolved db instance

async function openDb() {
  return open({ filename: DB_PATH, driver: sqlite3.Database });
}

async function tablesExist(dbInstance) {
  const rows = await dbInstance.all(
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('orders','masters','adl_media')"
  );
  return rows.length >= 3;
}

async function initDB() {
  try {
    const dbInstance = await openDb();
    // Enable WAL for better concurrency
    await dbInstance.exec('PRAGMA journal_mode = WAL;');

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!await tablesExist(dbInstance)) {
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await dbInstance.exec(schemaSql);
        console.log(`[DB] Schema initialized from ${schemaPath}`);
      } else {
        console.warn('[DB] schema.sql not found; tables may be missing');
      }
    }

    console.log(`[DB] Connected sqlite at ${DB_PATH}`);
    return dbInstance;
  } catch (err) {
    console.error('[DB] Initialization failed:', err);
    throw err;
  }
}

db = await initDB();

export default db; // has async methods: db.get/db.all/db.run return promises
export { db };
