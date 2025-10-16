// import 'dotenv/config';
// import db from './db/index.js';

// function clear() {
//   db.exec('DELETE FROM adl_media;');
//   db.exec('DELETE FROM orders;');
//   db.exec('DELETE FROM masters;');
// }

// function insertMasters() {
//   const masters = [
//     { name: 'Alice Johnson', rating: 4.8, isAvailable: 1, geo_lat: 40.7128, geo_lng: -74.0060 },
//     { name: 'Bob Smith', rating: 4.5, isAvailable: 1, geo_lat: 34.0522, geo_lng: -118.2437 },
//     { name: 'Carol Lee', rating: 4.9, isAvailable: 1, geo_lat: 41.8781, geo_lng: -87.6298 },
//     { name: 'David Kim', rating: 4.2, isAvailable: 1, geo_lat: 29.7604, geo_lng: -95.3698 }
//   ];
//   const stmt = db.prepare('INSERT INTO masters (name, rating, isAvailable, geo_lat, geo_lng) VALUES (?, ?, ?, ?, ?)');
//   const tx = db.transaction((rows) => {
//     for (const r of rows) stmt.run(r.name, r.rating, r.isAvailable, r.geo_lat, r.geo_lng);
//   });
//   tx(masters);
// }

// clear();
// insertMasters();
// console.log('Seed complete: inserted masters');

import 'dotenv/config';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const db = await open({
  filename: process.env.DB_PATH || './data/nexa.db',
  driver: sqlite3.Database,
});

async function clear() {
  await db.exec('DELETE FROM adl_media;');
  await db.exec('DELETE FROM orders;');
  await db.exec('DELETE FROM masters;');
}

async function insertMasters() {
  const masters = [
    { name: 'Alice Johnson', rating: 4.8, isAvailable: 1, geo_lat: 40.7128, geo_lng: -74.0060 },
    { name: 'Bob Smith', rating: 4.5, isAvailable: 1, geo_lat: 34.0522, geo_lng: -118.2437 },
    { name: 'Carol Lee', rating: 4.9, isAvailable: 1, geo_lat: 41.8781, geo_lng: -87.6298 },
    { name: 'David Kim', rating: 4.2, isAvailable: 1, geo_lat: 29.7604, geo_lng: -95.3698 },
  ];

  for (const r of masters) {
    await db.run(
      'INSERT INTO masters (name, rating, isAvailable, geo_lat, geo_lng) VALUES (?, ?, ?, ?, ?)',
      [r.name, r.rating, r.isAvailable, r.geo_lat, r.geo_lng]
    );
  }

  console.log('Seed complete: inserted masters');
}

async function main() {
  try {
    console.log('[DB] Connected sqlite at', process.env.DB_PATH || './data/nexa.db');
    await clear();
    await insertMasters();
    await db.close();
    console.log('✅ Database seed finished successfully!');
  } catch (err) {
    console.error('❌ Error during seed:', err);
  }
}

main();

