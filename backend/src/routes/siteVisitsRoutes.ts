import { Router } from 'express';
import {
  getSiteVisits,
  createSiteVisit,
  updateSiteVisit,
} from '../controllers/siteVisitsController';

const router = Router();

router.get('/', getSiteVisits);
router.post('/', createSiteVisit);
router.patch('/:id', updateSiteVisit);
router.patch('/', updateSiteVisit);

export default router;
