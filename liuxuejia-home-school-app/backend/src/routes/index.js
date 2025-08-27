import { Router } from 'express';
import authRoutes from './auth.js';
import emailRoutes from './emails.js';
import eventRoutes from './events.js';
import parentRoutes from './parents.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/emails', emailRoutes);
router.use('/events', eventRoutes);
router.use('/parents', parentRoutes);

export default router;


