import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

const roleHierarchy: Record<string, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  MANAGER: 2,
  VIEWER: 1,
};

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = Math.max(...roles.map(r => roleHierarchy[r] || 0));

    if (userLevel < requiredLevel) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    next();
  };
}
