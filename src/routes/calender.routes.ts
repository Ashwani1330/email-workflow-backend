import { RequestHandler, Router } from 'express';
import { findAvailability } from '../controllers/calender.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// A POST request is suitable here as we might send more complex queries in the future
router.post('/availability', protect as RequestHandler, findAvailability);

export default router;