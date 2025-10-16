import mastersService from '../services/mastersService.js';

export const listMasters = async (_req, res, next) => {
  try {
    const data = await mastersService.listMastersWithActiveCounts();
    res.json(data);
  } catch (err) {
    next(err);
  }
};


