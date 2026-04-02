import prisma from '../../config/database';

export class ReportService {
  async getDashboard() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStaff,
      totalStores,
      activeStaff,
      totalUsers,
      attendanceThisMonth,
      presentThisMonth,
      lateThisMonth,
      avgPerformance,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.staff.count(),
      prisma.store.count(),
      prisma.staff.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.induction.count({ where: { startDate: { gte: monthStart } } }),
      prisma.induction.count({ where: { startDate: { gte: monthStart }, status: 'COMPLETED' } }),
      prisma.induction.count({ where: { startDate: { gte: monthStart }, status: 'PENDING' } }),
      prisma.performanceReview.aggregate({ _avg: { score: true } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true } } },
      }),
    ]);

    const staffByStatus = await prisma.staff.groupBy({
      by: ['status'],
      _count: true,
    });

    const staffByStore = await prisma.staff.groupBy({
      by: ['storeId'],
      _count: true,
      orderBy: { _count: { storeId: 'desc' } },
      take: 10,
    });

    const stores = await prisma.store.findMany({
      where: { id: { in: staffByStore.map(s => s.storeId) } },
      select: { id: true, name: true },
    });

    return {
      totalStaff,
      totalStores,
      activeStaff,
      totalUsers,
      inductionsThisMonth: attendanceThisMonth, // alias for backwards compat with let's say frontend struct
      completedThisMonth: presentThisMonth,
      pendingThisMonth: lateThisMonth,
      avgPerformance: avgPerformance._avg.score || 0,
      completionRate: attendanceThisMonth > 0 ? ((presentThisMonth / attendanceThisMonth) * 100).toFixed(1) : 0,
      staffByStatus: staffByStatus.map(s => ({ status: s.status, count: s._count })),
      staffByStore: staffByStore.map(s => ({
        store: stores.find(st => st.id === s.storeId)?.name || 'Unknown',
        count: s._count,
      })),
      recentActivity: recentAuditLogs,
    };
  }

  async getStaffReport(query: any) {
    const { storeId, status, position } = query;
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (status) where.status = status;
    if (position) where.position = { contains: position, mode: 'insensitive' };

    const staff = await prisma.staff.findMany({
      where,
      include: { store: { select: { name: true } } },
      orderBy: { lastName: 'asc' },
    });

    const total = staff.length;
    const byStatus: Record<string, number> = {};
    const byPosition: Record<string, number> = {};

    staff.forEach(s => {
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
      byPosition[s.position] = (byPosition[s.position] || 0) + 1;
    });

    return { total, staff, byStatus, byPosition };
  }

  async getInductionReport(query: any) {
    const { storeId, startDate, endDate } = query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const where: any = { startDate: { gte: start, lte: end } };
    if (storeId) where.staff = { storeId };

    const records = await prisma.induction.findMany({
      where,
      include: {
        staff: { select: { firstName: true, lastName: true, staffId: true, store: { select: { name: true } } } },
      },
      orderBy: { startDate: 'desc' },
    });

    const byStatus: Record<string, number> = {};
    records.forEach(r => {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });

    return { total: records.length, records, byStatus, period: { start, end } };
  }

  async getPerformanceReport(query: any) {
    const { storeId, category } = query;
    const where: any = {};
    if (storeId) where.staff = { storeId };
    if (category) where.category = category;

    const reviews = await prisma.performanceReview.findMany({
      where,
      include: {
        staff: { select: { firstName: true, lastName: true, staffId: true } },
        reviewer: { select: { username: true } },
      },
      orderBy: { reviewDate: 'desc' },
    });

    const avgByCategory = await prisma.performanceReview.groupBy({
      by: ['category'],
      where,
      _avg: { score: true },
      _count: true,
    });

    return {
      total: reviews.length,
      reviews,
      avgByCategory: avgByCategory.map(c => ({
        category: c.category,
        avgScore: c._avg.score || 0,
        count: c._count,
      })),
    };
  }
}
