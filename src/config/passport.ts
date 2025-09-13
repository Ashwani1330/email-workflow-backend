import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config(); 

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.readonly'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // If user exists, update tokens and save
          user.accessToken = accessToken;
          if (refreshToken) user.refreshToken = refreshToken;
          await user.save();
          // *** FIX: Pass the updated user to the done() callback ***
          done(null, user);
        } else {
          // If new user, create one
          const newUser = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails![0].value,
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
          await newUser.save();
          done(null, newUser);
        }
      } catch (error) {
        done(error, false);
      }
    }
  )
);

// These are needed for session management
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
