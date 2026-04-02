import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN as any });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN as any });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
