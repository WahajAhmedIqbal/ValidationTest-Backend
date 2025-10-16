import ordersRepo from '../repositories/ordersRepository.js';
import mastersRepo from '../repositories/mastersRepository.js';
import adlRepo from '../repositories/adlMediaRepository.js';
import { ORDER_STATUS } from '../models/enums.js';
import { haversineKm } from '../utils/geo.js';
import { AppError } from '../utils/errors.js';

function ensureRequired(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length) {
    throw new AppError(400, `Missing required fields: ${missing.join(', ')}`);
  }
}

export class OrdersService {
  async createOrder(payload) {
    ensureRequired(payload, ['title', 'geo_lat', 'geo_lng']);
    const order = await ordersRepo.create({
      title: payload.title,
      description: payload.description ?? null,
      customerName: payload.customerName ?? null,
      customerPhone: payload.customerPhone ?? null,
      geo_lat: payload.geo_lat,
      geo_lng: payload.geo_lng
    });
    console.log(`[Order] Created #${order.id}`);
    return order;
  }

  async assignMaster(orderId) {
    const order = await ordersRepo.findById(orderId);
    if (!order) throw new AppError(404, 'Order not found');
    if (![ORDER_STATUS.NEW, ORDER_STATUS.REJECTED].includes(order.status)) {
      throw new AppError(409, `Cannot assign in status '${order.status}'`);
    }

    const masters = (await mastersRepo.findAll()).filter(m => m.isAvailable);
    if (!masters.length) throw new AppError(409, 'No available masters');
    if (order.geo_lat == null || order.geo_lng == null) throw new AppError(400, 'Order location required');

    // Compute distance, rating, and active load
    const scored = await Promise.all(masters.map(async (m) => {
      const distance = (m.geo_lat != null && m.geo_lng != null)
        ? haversineKm(order.geo_lat, order.geo_lng, m.geo_lat, m.geo_lng)
        : Number.POSITIVE_INFINITY;
      const activeLoad = await ordersRepo.countActiveByMaster(m.id);
      return { m, distance, rating: m.rating ?? 0, activeLoad };
    }));

    // Sort by distance asc, rating desc, activeLoad asc
    scored.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.rating !== b.rating) return b.rating - a.rating;
      return a.activeLoad - b.activeLoad;
    });

    const chosen = scored[0]?.m;
    if (!chosen || !isFinite(scored[0].distance)) {
      throw new AppError(409, 'No eligible master with location');
    }

    const updatedOrder = await ordersRepo.assignMaster(order.id, chosen.id);
    await mastersRepo.setAvailability(chosen.id, false);
    console.log(`[Order] Assigned master #${chosen.id} to order #${order.id}`);
    return updatedOrder;
  }

  async attachAdl(orderId, payload) {
    const order = await ordersRepo.findById(orderId);
    if (!order) throw new AppError(404, 'Order not found');
    ensureRequired(payload, ['type', 'url', 'gps_lat', 'gps_lng', 'capturedAt']);
    if (!['photo', 'video'].includes(payload.type)) {
      throw new AppError(400, 'Invalid ADL type');
    }
    const adl = await adlRepo.create({
      orderId: order.id,
      type: payload.type,
      url: payload.url,
      gps_lat: payload.gps_lat,
      gps_lng: payload.gps_lng,
      capturedAt: payload.capturedAt,
      meta: payload.meta ?? null
    });
    console.log(`[ADL] Added ${payload.type} #${adl.id} for order #${order.id}`);
    // Optional: move status to in_progress on first ADL
    if (order.status === ORDER_STATUS.ASSIGNED) {
      await ordersRepo.updateStatus(order.id, ORDER_STATUS.IN_PROGRESS);
    }
    return adl;
  }

  async completeOrder(orderId) {
    const order = await ordersRepo.findById(orderId);
    if (!order) throw new AppError(404, 'Order not found');
    if (![ORDER_STATUS.ASSIGNED, ORDER_STATUS.IN_PROGRESS].includes(order.status)) {
      throw new AppError(409, `Cannot complete in status '${order.status}'`);
    }
    const ok = await adlRepo.existsPhotoWithRequiredFields(order.id);
    if (!ok) throw new AppError(400, 'Missing ADL requirements');

    await ordersRepo.updateStatus(order.id, ORDER_STATUS.COMPLETED);
    if (order.assignedMasterId) {
      await mastersRepo.setAvailability(order.assignedMasterId, true);
    }
    console.log(`[Order] Completed #${order.id}`);
    return await ordersRepo.findById(order.id);
  }

  async getOrder(id) {
    const data = await ordersRepo.findWithMasterById(id);
    if (!data) throw new AppError(404, 'Order not found');
    return data;
  }

  async getAllOrders() {
    return ordersRepo.findAll();
  }

  async updateOrderStatus(orderId, newStatus) {
    const allowed = Object.values(ORDER_STATUS);
    if (!allowed.includes(newStatus)) {
      throw new AppError(400, 'Invalid status');
    }
    const order = await ordersRepo.findById(orderId);
    if (!order) throw new AppError(404, 'Order not found');

    // Allowed transitions
    const transitions = {
      [ORDER_STATUS.NEW]: new Set([ORDER_STATUS.ASSIGNED, ORDER_STATUS.REJECTED]),
      [ORDER_STATUS.ASSIGNED]: new Set([ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.REJECTED]),
      [ORDER_STATUS.IN_PROGRESS]: new Set([ORDER_STATUS.COMPLETED, ORDER_STATUS.REJECTED])
    };

    if (order.status === newStatus) return order;

    const allowedNext = transitions[order.status];
    if (!allowedNext || !allowedNext.has(newStatus)) {
      throw new AppError(400, 'Invalid status transition');
    }

    // Special side effects
    if (newStatus === ORDER_STATUS.ASSIGNED) {
      if (!order.assignedMasterId) throw new AppError(400, 'Assign a master first');
      await mastersRepo.setAvailability(order.assignedMasterId, false);
    }
    if (newStatus === ORDER_STATUS.COMPLETED) {
      const ok = await adlRepo.existsPhotoWithRequiredFields(order.id);
      if (!ok) throw new AppError(400, 'Missing ADL requirements');
      if (order.assignedMasterId) await mastersRepo.setAvailability(order.assignedMasterId, true);
    }
    if (newStatus === ORDER_STATUS.REJECTED) {
      if (order.assignedMasterId) await mastersRepo.setAvailability(order.assignedMasterId, true);
    }

    const updated = await ordersRepo.updateStatus(order.id, newStatus);
    return updated;
  }
}

export default new OrdersService();


