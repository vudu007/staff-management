import prisma from '../../config/database';
import { sendEmail } from '../../config/email';

export class EmailService {
  async sendEmail(to: string | string[], subject: string, body: string) {
    return sendEmail(to, subject, body);
  }

  async sendCredentials(staffIds: string[], recipient: string) {
    const staff = await prisma.staff.findMany({
      where: { id: { in: staffIds } },
      include: { store: true },
    });

    if (staff.length === 0) {
      return { success: false, error: 'No staff found' };
    }

    let body = 'Staff Credentials Report\n\n';
    body += 'Store | ID | Name | Position | Password\n';
    body += '-'.repeat(60) + '\n';

    staff.forEach(s => {
      body += `${s.store.name} | ${s.staffId} | ${s.firstName} ${s.lastName} | ${s.position} | ${s.plainPassword || 'N/A'}\n`;
    });

    body += `\nGenerated: ${new Date().toISOString()}\nTotal: ${staff.length} staff members`;

    return sendEmail(recipient, `Staff Credentials - ${new Date().toLocaleDateString()}`, body);
  }

  async getSmtpConfigs() {
    return prisma.sMTPConfig.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        server: true,
        port: true,
        encryption: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createSmtpConfig(data: any) {
    return prisma.sMTPConfig.create({
      data: {
        name: data.name,
        email: data.email,
        passwordEncrypted: data.password,
        server: data.server,
        port: parseInt(data.port),
        encryption: data.encryption || 'TLS',
        isActive: data.isActive || false,
      },
    });
  }

  async updateSmtpConfig(id: string, data: any) {
    const updateData: any = { ...data };
    if (data.port) updateData.port = parseInt(data.port);
    return prisma.sMTPConfig.update({ where: { id }, data: updateData });
  }

  async deleteSmtpConfig(id: string) {
    return prisma.sMTPConfig.delete({ where: { id } });
  }
}
