import { Router } from "express";
import { getEmails, getEmailByIdAndAnalyze } from "../controllers/email.controller";
import { protect } from "../middleware/auth.middleware";
import type { RequestHandler } from 'express';   

const router = Router();

// This route is protected by our 'protect' middleware
router.get('/', protect as RequestHandler, getEmails);

// This route gets a specific email by its ID and returns AI analysis
router.get('/:id/analysis', protect as RequestHandler, getEmailByIdAndAnalyze);

export default router;