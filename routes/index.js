import { Router } from 'express';
import ordersRouter from './orders.js';
import mastersRouter from './masters.js';

const router = Router();

router.use('/orders', ordersRouter);
router.use('/masters', mastersRouter);

export default router;


