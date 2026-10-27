import { Router } from 'express';
import { getStats, getConnectionStatus } from '../controllers/statsController';

const router = Router();

router.get('/stats', getStats);
router.get('/connection', getConnectionStatus);

export default router;
