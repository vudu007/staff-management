import prisma from '../../config/database';

export class StoreService {
  async getAll(query: any) {
    const { search, isActive } = query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) where.isActive = isActive === 'true';

    return prisma.store.findMany({
      where,
      include: {
        _count: { select: { staff: true } },
        manager: { select: { id: true, username: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.store.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, username: true, email: true } },
        _count: { select: { staff: true } },
      },
    });
  }

  async getStaff(storeId: string) {
    return prisma.staff.findMany({
      where: { storeId },
      orderBy: { lastName: 'asc' },
    });
  }

  async getAnalytics(storeId: string) {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new Error('Store not found');

    const [totalStaff, activeStaff, attendanceThisMonth, avgPerformance] = await Promise.all([
      prisma.staff.count({ where: { storeId } }),
      prisma.staff.count({ where: { storeId, status: 'ACTIVE' } }),
      prisma.attendance.count({
        where: {
          staff: { storeId },
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.performanceReview.aggregate({
        where: { staff: { storeId } },
        _avg: { score: true },
      }),
    ]);

    return {
      totalStaff,
      activeStaff,
      inactiveStaff: totalStaff - activeStaff,
      attendanceThisMonth,
      avgPerformance: avgPerformance._avg.score || 0,
    };
  }

  async create(data: any) {
    return prisma.store.create({
      data: {
        ...data,
        code: data.code || data.name.toLowerCase().replace(/\s+/g, '-'),
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.store.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.store.delete({ where: { id } });
  }
}
