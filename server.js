import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// Ensure DB is initialized on startup
import db from './db/index.js';

import router from './routes/index.js';
import { errorHandler, notFoundHandler } from './utils/errors.js';

// Auto-seed function to check and populate masters if needed
async function autoSeedMasters() {
  try {
    // Check if masters table has any records
    const result = await db.get('SELECT COUNT(*) as count FROM masters');
    const masterCount = result.count;
    
    if (masterCount === 0) {
      console.log('🌱 Masters table is empty, seeding default data...');
      
      const masters = [
        { name: 'Alice Johnson', rating: 4.8, isAvailable: 1, geo_lat: 40.7128, geo_lng: -74.0060 },
        { name: 'Bob Smith', rating: 4.5, isAvailable: 1, geo_lat: 34.0522, geo_lng: -118.2437 },
        { name: 'Carol Lee', rating: 4.9, isAvailable: 1, geo_lat: 41.8781, geo_lng: -87.6298 },
        { name: 'David Kim', rating: 4.2, isAvailable: 1, geo_lat: 29.7604, geo_lng: -95.3698 }
      ];

      for (const master of masters) {
        await db.run(
          'INSERT INTO masters (name, rating, isAvailable, geo_lat, geo_lng) VALUES (?, ?, ?, ?, ?)',
          [master.name, master.rating, master.isAvailable, master.geo_lat, master.geo_lng]
        );
      }
      
      console.log('✅ Successfully seeded 4 masters');
    } else {
      console.log('✅ Masters already exist, skipping seed.');
    }
  } catch (error) {
    console.error('❌ Error during auto-seed:', error);
    // Don't block server startup if seeding fails
  }
}

// Run auto-seed after DB is ready
await autoSeedMasters();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', router);

// 404 and error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Nexa backend running on port ${PORT}`);
});


