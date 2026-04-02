import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../config/jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
}
