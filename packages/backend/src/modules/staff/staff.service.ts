import prisma from '../../config/database';
import { hashPassword, generateSecurePassword } from '../../utils/crypto';
import { buildPagination, createPaginatedResponse } from '../../utils/pagination';
import { CsvRow } from '../../utils/csv';

export class StaffService {
  async getAll(query: any) {
    const { skip, take, page, limit } = buildPagination(query);
    const { search, storeId, status, position, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { staffId: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (storeId) where.storeId = storeId;
    if (status) where.status = status;
    if (position) where.position = { contains: position, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: { store: { select: { id: true, name: true, code: true } } },
      }),
      prisma.staff.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async getAllForExport(filters: { storeId?: string; status?: string; position?: string }) {
    const where: any = {};
    if (filters.storeId) where.storeId = filters.storeId;
    if (filters.status) where.status = filters.status;
    if (filters.position) where.position = { contains: filters.position, mode: 'insensitive' };

    return prisma.staff.findMany({
      where,
      include: { store: true },
      orderBy: { lastName: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.staff.findUnique({
      where: { id },
      include: {
        store: true,
        attendance: { orderBy: { date: 'desc' }, take: 30 },
        performanceReviews: { orderBy: { reviewDate: 'desc' }, take: 10 },
      },
    });
  }

  async create(data: any) {
    const plainPassword = generateSecurePassword(6);
    const passwordHash = await hashPassword(plainPassword);

    return prisma.staff.create({
      data: {
        ...data,
        passwordHash,
        plainPassword,
        lastPasswordReset: new Date(),
      },
      include: { store: true },
    });
  }

  async update(id: string, data: any) {
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing) throw new Error('Staff not found');

    const updateData: any = { ...data };

    if (data.resetPassword) {
      const plainPassword = generateSecurePassword(6);
      updateData.passwordHash = await hashPassword(plainPassword);
      updateData.plainPassword = plainPassword;
      updateData.lastPasswordReset = new Date();
    }

    delete updateData.resetPassword;

    return prisma.staff.update({
      where: { id },
      data: updateData,
      include: { store: true },
    });
  }

  async delete(id: string) {
    return prisma.staff.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    const result = await prisma.staff.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  async bulkTransfer(ids: string[], storeId: string) {
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new Error('Store not found');

    const result = await prisma.staff.updateMany({
      where: { id: { in: ids } },
      data: { storeId },
    });
    return result.count;
  }

  async importStaff(rows: CsvRow[]) {
    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const storeCode = (row['Store'] || row['store'] || '').trim().toLowerCase().replace(/\s+/g, '-');
        const staffId = (row['ID'] || row['id'] || row['Staff ID'] || '').trim();
        const firstName = (row['First Name'] || row['FirstName'] || row['Name'] || row['first_name'] || '').trim();
        const lastName = (row['Last Name'] || row['LastName'] || row['last_name'] || '').trim();
        const position = (row['Position'] || row['position'] || row['Title'] || '').trim();
        const phone = (row['Phone'] || row['phone'] || '').trim();
        const email = (row['Email'] || row['email'] || '').trim();

        if (!storeCode || !staffId || !firstName) {
          errors.push(`Row ${i + 2}: Missing required fields (Store, ID, First Name)`);
          continue;
        }

        let store = await prisma.store.findFirst({
          where: { OR: [{ code: storeCode }, { name: { contains: row['Store'] || row['store'], mode: 'insensitive' } }] },
        });

        if (!store) {
          store = await prisma.store.create({
            data: {
              name: row['Store'] || row['store'] || storeCode,
              code: storeCode,
            },
          });
        }

        const existing = await prisma.staff.findUnique({ where: { staffId } });
        const plainPassword = generateSecurePassword(6);
        const passwordHash = await hashPassword(plainPassword);

        if (existing) {
          await prisma.staff.update({
            where: { staffId },
            data: {
              firstName: firstName || existing.firstName,
              lastName: lastName || existing.lastName,
              position: position || existing.position,
              phone: phone || existing.phone,
              email: email || existing.email,
              storeId: store.id,
            },
          });
          updated++;
        } else {
          await prisma.staff.create({
            data: {
              staffId,
              firstName,
              lastName: lastName || '',
              position: position || 'Sales Associate',
              phone,
              email,
              storeId: store.id,
              passwordHash,
              plainPassword,
              lastPasswordReset: new Date(),
            },
          });
          imported++;
        }
      } catch (error: any) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    return { imported, updated, errors };
  }
}
