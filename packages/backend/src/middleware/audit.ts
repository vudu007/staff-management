import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuditAction, AuditEntityType } from '@prisma/client';

interface AuditOptions {
  action: AuditAction;
  entityType: AuditEntityType;
  entityIdField?: string;
}

export function auditLog(options: AuditOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      if (body?.success !== false) {
        const userId = (req as any).user?.userId || 'system';
        const entityId = options.entityIdField
          ? (req.params[options.entityIdField] || req.body[options.entityIdField] || body?.id || 'unknown')
          : 'unknown';

        prisma.auditLog.create({
          data: {
            userId,
            action: options.action,
            entityType: options.entityType,
            entityId,
            oldValue: req.body._oldValue || null,
            newValue: req.body._newValue || req.body || null,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'] || null,
          },
        }).catch(() => {});
      }

      return originalJson(body);
    };

    next();
  };
}
