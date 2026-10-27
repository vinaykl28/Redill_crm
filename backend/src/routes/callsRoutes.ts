import { Router } from 'express';
import { getCalls, createCall } from '../controllers/callsController';

const router = Router();

router.get('/', getCalls);
router.post('/', createCall);

export default router;
