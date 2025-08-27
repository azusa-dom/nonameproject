import { Router } from 'express';
import { bindChild, listChildren, getChildData } from '../controllers/parentController.js';

const router = Router();

router.post('/bind', bindChild);
router.get('/children', listChildren);
router.get('/data/:childId', getChildData);

export default router;


