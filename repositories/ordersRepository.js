import db from '../db/index.js';
import { ORDER_STATUS } from '../models/enums.js';

export class OrdersRepository {
  async create({ title, description = null, customerName = null, customerPhone = null, geo_lat = null, geo_lng = null }) {
    const now = new Date().toISOString();
    const result = await db.run(
      `INSERT INTO orders (title, description, status, customerName, customerPhone, geo_lat, geo_lng, assignedMasterId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      title, description, ORDER_STATUS.NEW, customerName, customerPhone, geo_lat, geo_lng, now, now
    );
    return this.findById(result.lastID);
  }

  async findById(id) {
    return db.get('SELECT * FROM orders WHERE id = ?', id);
  }

  async findAll() {
    return db.all('SELECT * FROM orders ORDER BY datetime(createdAt) DESC');
  }

  async findWithMasterById(id) {
    const order = await this.findById(id);
    if (!order) return null;
    const master = order.assignedMasterId ? await db.get('SELECT * FROM masters WHERE id = ?', order.assignedMasterId) : null;
    const adl = await db.all('SELECT * FROM adl_media WHERE orderId = ?', id);
    return { ...order, master, adl };
  }

  async updateStatus(id, status) {
    const now = new Date().toISOString();
    await db.run('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?', status, now, id);
    return this.findById(id);
  }

  async assignMaster(id, masterId) {
    const now = new Date().toISOString();
    await db.run('UPDATE orders SET assignedMasterId = ?, status = ?, updatedAt = ? WHERE id = ?', masterId, ORDER_STATUS.ASSIGNED, now, id);
    return this.findById(id);
  }

  async countActiveByMaster(masterId) {
    const row = await db.get(
      'SELECT COUNT(*) as cnt FROM orders WHERE assignedMasterId = ? AND status NOT IN (?, ?)',
      masterId, ORDER_STATUS.COMPLETED, ORDER_STATUS.REJECTED
    );
    return row?.cnt ?? 0;
  }

  async findActiveOrdersByMaster(masterId) {
    return db.all('SELECT * FROM orders WHERE assignedMasterId = ? AND status NOT IN (?, ?)', masterId, ORDER_STATUS.COMPLETED, ORDER_STATUS.REJECTED);
  }
}

export default new OrdersRepository();


