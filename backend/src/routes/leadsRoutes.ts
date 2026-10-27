import { Router } from 'express';
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
} from '../controllers/leadsController';

const router = Router();

router.get('/', getLeads);
router.post('/', createLead);
router.patch('/:id', updateLead);
router.patch('/', updateLead);
router.delete('/:id', deleteLead);
router.delete('/', deleteLead);

export default router;
