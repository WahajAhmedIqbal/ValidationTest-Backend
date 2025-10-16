import ordersService from '../services/ordersService.js';

export const createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

export const assignOrder = async (req, res, next) => {
  try {
    const updated = await ordersService.assignMaster(Number(req.params.id));
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const attachAdl = async (req, res, next) => {
  try {
    const adl = await ordersService.attachAdl(Number(req.params.id), req.body);
    res.status(201).json(adl);
  } catch (err) {
    next(err);
  }
};

export const completeOrder = async (req, res, next) => {
  try {
    const updated = await ordersService.completeOrder(Number(req.params.id));
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const data = await ordersService.getOrder(Number(req.params.id));
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const listOrders = async (_req, res, next) => {
  try {
    const data = await ordersService.getAllOrders();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await ordersService.updateOrderStatus(Number(req.params.id), status);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const updated = await ordersService.updateOrderStatus(Number(req.params.id), 'rejected');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};


