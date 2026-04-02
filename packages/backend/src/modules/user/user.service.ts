import prisma from '../../config/database';
import { hashPassword } from '../../utils/crypto';

export class UserService {
  async getAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { username: 'asc' },
    });
  }

  async create(data: any) {
    const passwordHash = await hashPassword(data.password);
    return prisma.user.create({
      data: {
        username: data.username,
        passwordHash,
        role: data.role,
        email: data.email,
        isActive: data.isActive !== false,
      },
      select: {
        id: true,
        username: true,
        role: true,
        email: true,
        isActive: true,
      },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {
      role: data.role,
      email: data.email,
      isActive: data.isActive,
    };

    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        email: true,
        isActive: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
