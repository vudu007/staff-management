import prisma from '../../config/database';
import { comparePassword, hashPassword } from '../../utils/crypto';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../../config/jwt';

export class AuthService {
  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    const newPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      success: true,
      data: {
        accessToken: generateAccessToken(newPayload),
        refreshToken: generateRefreshToken(newPayload),
      },
    };
  }
}
