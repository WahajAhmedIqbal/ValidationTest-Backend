import db from '../db/index.js';

export class AdlMediaRepository {
  async create({ orderId, type, url, gps_lat = null, gps_lng = null, capturedAt = null, meta = null }) {
    const result = await db.run(
      `INSERT INTO adl_media (orderId, type, url, gps_lat, gps_lng, capturedAt, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      orderId, type, url, gps_lat, gps_lng, capturedAt, meta ? JSON.stringify(meta) : null
    );
    return this.findById(result.lastID);
  }

  async findById(id) {
    const row = await db.get('SELECT * FROM adl_media WHERE id = ?', id);
    if (!row) return null;
    return { ...row, meta: row.meta ? JSON.parse(row.meta) : null };
  }

  async findByOrderId(orderId) {
    const rows = await db.all('SELECT * FROM adl_media WHERE orderId = ?', orderId);
    return rows.map(r => ({ ...r, meta: r.meta ? JSON.parse(r.meta) : null }));
  }

  async existsPhotoWithRequiredFields(orderId) {
    const row = await db.get(
      `SELECT id FROM adl_media
       WHERE orderId = ? AND type = 'photo' AND gps_lat IS NOT NULL AND gps_lng IS NOT NULL AND capturedAt IS NOT NULL
       LIMIT 1`,
      orderId
    );
    return !!row;
  }
}

export default new AdlMediaRepository();


