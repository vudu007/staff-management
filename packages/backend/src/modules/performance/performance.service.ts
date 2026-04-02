import prisma from '../../config/database';

export class PerformanceService {
  async create(data: any) {
    return prisma.performanceReview.create({
      data: {
        staffId: data.staffId,
        reviewerId: data.reviewerId,
        reviewDate: new Date(data.reviewDate),
        score: parseInt(data.score),
        category: data.category,
        comments: data.comments,
      },
      include: {
        staff: { select: { firstName: true, lastName: true, staffId: true } },
        reviewer: { select: { username: true } },
      },
    });
  }

  async getByStaff(staffId: string) {
    return prisma.performanceReview.findMany({
      where: { staffId },
      orderBy: { reviewDate: 'desc' },
      include: {
        reviewer: { select: { username: true } },
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.performanceReview.update({
      where: { id },
      data: {
        score: data.score ? parseInt(data.score) : undefined,
        category: data.category,
        comments: data.comments,
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : undefined,
      },
    });
  }

  async getSummary(query: any) {
    const { storeId, category } = query;
    const where: any = {};
    if (storeId) where.staff = { storeId };
    if (category) where.category = category;

    const [total, avgScore, byCategory] = await Promise.all([
      prisma.performanceReview.count({ where }),
      prisma.performanceReview.aggregate({ where, _avg: { score: true } }),
      prisma.performanceReview.groupBy({
        by: ['category'],
        where,
        _avg: { score: true },
        _count: true,
      }),
    ]);

    return {
      total,
      avgScore: avgScore._avg.score || 0,
      byCategory: byCategory.map(c => ({
        category: c.category,
        avgScore: c._avg.score || 0,
        count: c._count,
      })),
    };
  }
}
