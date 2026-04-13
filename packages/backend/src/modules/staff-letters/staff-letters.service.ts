import prisma from '../../config/database';
import { sendEmail } from '../../config/email';
import { buildPagination, createPaginatedResponse } from '../../utils/pagination';

export class StaffLettersService {
  async getAll(query: any) {
    const { skip, take, page, limit } = buildPagination(query);
    const { staffId, type, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {};
    if (staffId) where.staffId = staffId;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      prisma.staffLetter.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: { staff: true }
      }),
      prisma.staffLetter.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async getById(id: string) {
    return prisma.staffLetter.findUnique({
      where: { id },
      include: { staff: true }
    });
  }

  async createLetter(data: any) {
    return prisma.staffLetter.create({
      data: {
        staffId: data.staffId,
        type: data.type,
        subject: data.subject,
        content: data.content,
        status: data.status || 'DRAFT'
      }
    });
  }

  async sendLetter(id: string) {
    const letter = await prisma.staffLetter.findUnique({
      where: { id },
      include: { staff: true }
    });

    if (!letter) throw new Error('Letter not found');
    if (!letter.staff.email) throw new Error('Staff member has no email address');

    // Create an HTML fallback or just send text using the generic sendEmail
    const body = `
      Dear ${letter.staff.firstName} ${letter.staff.lastName},
      
      ${letter.content}
      
      Best Regards,
      Management
    `;

    // Try to send email
    await sendEmail(letter.staff.email, letter.subject, body);

    return prisma.staffLetter.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() }
    });
  }

  async delete(id: string) {
    return prisma.staffLetter.delete({ where: { id } });
  }
}
