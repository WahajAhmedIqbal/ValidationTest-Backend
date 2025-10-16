import mastersRepo from '../repositories/mastersRepository.js';
import ordersRepo from '../repositories/ordersRepository.js';

export class MastersService {
  async listMastersWithActiveCounts() {
    const masters = await mastersRepo.findAll();
    const withCounts = await Promise.all(masters.map(async (m) => ({
      ...m,
      activeOrders: await ordersRepo.countActiveByMaster(m.id)
    })));
    return withCounts;
  }
}

export default new MastersService();


