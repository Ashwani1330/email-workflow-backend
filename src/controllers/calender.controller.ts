import { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import type { IAuthRequest } from '../middleware/auth.middleware'; // Adjust path if needed

dotenv.config();

export const findAvailability = async (req: Request, res: Response) => {
    try {
        const authReq = req as IAuthRequest;

        if (!authReq.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // 1. Create a fully configured OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            '/api/auth/google/callback'
        );

        // 2. Set the user's credentials on the client
        oauth2Client.setCredentials({
            access_token: authReq.user.accessToken,
            refresh_token: authReq.user.refreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        // 3. Make the API call
        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: now.toISOString(),
                timeMax: sevenDaysFromNow.toISOString(),
                timeZone: 'UTC',
                items: [{ id: 'primary' }],
            },
        });

        const busySlots = response.data.calendars?.primary.busy;

        res.json({ busy: busySlots || [] });

    } catch (error) {
        console.error('Error fetching calendar availability:', error);
        res.status(500).json({ message: 'Failed to fetch calendar availability' });
    }
};
