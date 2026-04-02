import prisma from '../../config/database';

export class InductionService {
  async getAllInductions() {
    return prisma.induction.findMany({
      include: {
        staff: true,
        trainer: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInductionById(id: string) {
    const induction = await prisma.induction.findUnique({
      where: { id },
      include: {
        staff: true,
        trainer: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    if (!induction) {
      throw new Error('Induction not found');
    }

    return induction;
  }

  async createInduction(data: { staffId: string; startDate: Date; status: string; trainerId?: string; notes?: string; taxIdVerified?: boolean }) {
    return prisma.induction.create({
      data,
      include: {
        staff: true,
      },
    });
  }

  async updateInduction(id: string, data: { status?: string; completionDate?: Date; trainerId?: string; notes?: string; taxIdVerified?: boolean }) {
    return prisma.induction.update({
      where: { id },
      data,
    });
  }

  async deleteInduction(id: string) {
    return prisma.induction.delete({
      where: { id },
    });
  }
}
