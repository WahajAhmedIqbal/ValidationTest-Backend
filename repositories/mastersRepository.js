import db from '../db/index.js';

export class MastersRepository {
  async create({ name, rating = 0, isAvailable = true, geo_lat = null, geo_lng = null }) {
    const result = await db.run(
      'INSERT INTO masters (name, rating, isAvailable, geo_lat, geo_lng) VALUES (?, ?, ?, ?, ?)',
      name, rating, isAvailable ? 1 : 0, geo_lat, geo_lng
    );
    return this.findById(result.lastID);
  }

  async findById(id) {
    return db.get('SELECT * FROM masters WHERE id = ?', id);
  }

  async findAll() {
    return db.all('SELECT * FROM masters');
  }

  async setAvailability(id, isAvailable) {
    await db.run('UPDATE masters SET isAvailable = ? WHERE id = ?', isAvailable ? 1 : 0, id);
    return this.findById(id);
  }

  async updateLocation(id, geo_lat, geo_lng) {
    await db.run('UPDATE masters SET geo_lat = ?, geo_lng = ? WHERE id = ?', geo_lat, geo_lng, id);
    return this.findById(id);
  }
}

export default new MastersRepository();


