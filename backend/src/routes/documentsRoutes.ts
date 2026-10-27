import { Router } from 'express';
import { getDocuments, createDocument } from '../controllers/documentsController';

const router = Router();

router.get('/', getDocuments);
router.post('/', createDocument);

export default router;
