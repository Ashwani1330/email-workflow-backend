import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes'

// Import the passport config to execute the setup
import './config/passport';
import connectDB from './config/db';

dotenv.config()

const app = express();
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true })); // Required for passport.session()

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
