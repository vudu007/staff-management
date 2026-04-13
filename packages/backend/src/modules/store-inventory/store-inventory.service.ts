import prisma from '../../config/database';
import { buildPagination, createPaginatedResponse } from '../../utils/pagination';
import { CsvRow } from '../../utils/csv';

export class StoreInventoryService {
  async getAll(query: any) {
    const { skip, take, page, limit } = buildPagination(query);
    const { search, storeId, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (search) {
      where.OR = [
        { itemName: { contains: search } },
        { sku: { contains: search } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.storeInventory.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: { store: true }
      }),
      prisma.storeInventory.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async create(data: any) {
    return prisma.storeInventory.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.storeInventory.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.storeInventory.delete({ where: { id } });
  }

  async importInventory(storeId: string, rows: CsvRow[]) {
    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new Error('Store not found');

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
            const itemName = (row['Item Name'] || row['itemName'] || row['Name'] || '').trim();
            const sku = (row['SKU'] || row['sku'] || '').trim();
            const quantityStr = (row['Quantity'] || row['quantity'] || '0').trim();
            const unit = (row['Unit'] || row['unit'] || 'pcs').trim();

            if (!itemName) {
                errors.push(`Row ${i + 2}: Missing required fields (Item Name)`);
                continue;
            }

            const quantity = parseInt(quantityStr, 10) || 0;

            const existing = sku ? await prisma.storeInventory.findFirst({
                where: { storeId, sku }
            }) : await prisma.storeInventory.findFirst({
                where: { storeId, itemName }
            });

            if (existing) {
                await prisma.storeInventory.update({
                    where: { id: existing.id },
                    data: {
                        quantity: existing.quantity + quantity,
                        unit: unit || existing.unit
                    }
                });
                updated++;
            } else {
                await prisma.storeInventory.create({
                    data: {
                        storeId,
                        itemName,
                        sku,
                        quantity,
                        unit
                    }
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
