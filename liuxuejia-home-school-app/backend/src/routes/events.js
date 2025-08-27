import { Router } from 'express';
import { listEvents, getEvent, updateEvent, deleteEvent, feedback } from '../controllers/eventController.js';

const router = Router();

router.get('/', listEvents);
router.get('/:id', getEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/feedback', feedback);

export default router;


