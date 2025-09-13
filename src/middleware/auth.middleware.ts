import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';

// Extend the Express Request interface to include the user object
export interface IAuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

      // Get user from the token and attach it to the request object
      req.user = await User.findById(decoded.id).select('-password'); // '-password' is good practice if you had one

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
