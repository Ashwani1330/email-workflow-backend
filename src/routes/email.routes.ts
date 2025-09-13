import { Router } from "express";
import { getEmails } from "../controllers/email.controller";
import { protect } from "../middleware/auth.middleware";
import type { RequestHandler } from 'express';   

const router = Router();


// This route is protected by our 'protect' middleware
router.get('/', protect as RequestHandler, getEmails);

export default router;
