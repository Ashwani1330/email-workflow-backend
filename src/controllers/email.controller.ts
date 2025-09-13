import { Request, Response } from 'express';
import { google } from 'googleapis';


import { IAuthRequest } from '../middleware/auth.middleware';

export const getEmails = async (req: Request, res: Response) => {
  const authReq = req as IAuthRequest;
  try {
    if (!authReq.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: authReq.user.accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10, // Fetch the 10 most recent emails
      q: 'in:inbox',
    });
    
    // The response only contains message IDs, you would typically fetch full messages next
    // But for now, just sending the list is a great test
    res.json(response.data.messages || []);

  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: 'Failed to fetch emails' });
  }
};

