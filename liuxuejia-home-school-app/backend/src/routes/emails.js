import { Router } from 'express';
import { syncEmails, syncStatus } from '../controllers/emailController.js';

const router = Router();

router.post('/sync', syncEmails);
router.get('/status', syncStatus);

export default router;


