import { Router } from 'express';
import { listMasters } from '../controllers/mastersController.js';

const router = Router();

router.get('/', listMasters);

export default router;


