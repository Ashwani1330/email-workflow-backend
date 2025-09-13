import { Router } from "express";
import passport from "passport";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

// Login Route - Redirects to Google
router.get(
  '/google',
  passport.authenticate('google', { accessType: 'offline', prompt: 'consent'}) // 'offline' gets the refreshToken
)

// Callback Route - Google redirects here
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req: any, res) => {
    // On successful authentication, user object is attached to req
    const user = req.user;
    // Create a JWT for our own app's session management
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

    // Redirects user back to the frontend, passing the token
    res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
  }
);

export default router;
