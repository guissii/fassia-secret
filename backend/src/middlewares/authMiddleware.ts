import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  // BYPASS: No security for admin page as requested
  req.user = { userId: "bypassed-admin", email: "admin@fassia.com" };
  next();
};