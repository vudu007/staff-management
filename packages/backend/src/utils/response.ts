import { Response } from 'express';

export function successResponse(res: Response, data: any, message?: string, statusCode?: number) {
  return res.status(statusCode || 200).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(res: Response, message: string, statusCode?: number, errors?: any) {
  return res.status(statusCode || 400).json({
    success: false,
    message,
    errors,
  });
}
