import { Router } from 'express';
import { createOrder, assignOrder, attachAdl, completeOrder, getOrder, listOrders, updateOrderStatus, cancelOrder } from '../controllers/ordersController.js';

const router = Router();

router.get('/', listOrders);
router.post('/', createOrder);
router.post('/:id/assign', assignOrder);
router.post('/:id/adl', attachAdl);
router.post('/:id/complete', completeOrder);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/cancel', cancelOrder);

export default router;


