import prisma from '../../config/database';
import { buildPagination, createPaginatedResponse } from '../../utils/pagination';

export class StoreRequisitionService {
  async getAll(query: any) {
    const { skip, take, page, limit } = buildPagination(query);
    const { storeId, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.storeRequisition.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: { store: true, items: { include: { inventory: true } } }
      }),
      prisma.storeRequisition.count({ where }),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async getById(id: string) {
    return prisma.storeRequisition.findUnique({
      where: { id },
      include: { store: true, items: { include: { inventory: true } } }
    });
  }

  async create(data: any) {
    const { storeId, requesterName, notes, items } = data; // items: [{ inventoryId, quantityRequested }]
    
    return prisma.storeRequisition.create({
      data: {
        storeId,
        requesterName,
        notes,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            inventoryId: item.inventoryId,
            quantityRequested: item.quantityRequested,
            quantityFulfilled: 0
          }))
        }
      },
      include: { items: true }
    });
  }

  async updateStatus(id: string, status: string, fulfillmentData?: any[]) {
    // fulfillmentData: [{ itemId (StoreRequisitionItem.id), quantityFulfilled }]
    
    const requisition = await prisma.storeRequisition.findUnique({
      where: { id },
      include: { items: { include: { inventory: true } } }
    });

    if (!requisition) throw new Error('Requisition not found');

    if (status === 'FULFILLED') {
      if (requisition.status === 'FULFILLED') throw new Error('Already fulfilled');
      
      // We must deplete inventory in a transaction
      const updates = [];
      const itemUpdates = [];

      for (const reqItem of requisition.items) {
        let qFulfilled = reqItem.quantityRequested; 
        
        if (fulfillmentData) {
          const match = fulfillmentData.find(f => f.itemId === reqItem.id);
          if (match) qFulfilled = match.quantityFulfilled;
        }

        if (qFulfilled > 0) {
          if (reqItem.inventory.quantity < qFulfilled) {
            throw new Error(`Insufficient inventory for item ${reqItem.inventory.itemName}`);
          }
          updates.push(
            prisma.storeInventory.update({
              where: { id: reqItem.inventoryId },
              data: { quantity: { decrement: qFulfilled } }
            })
          );
          itemUpdates.push(
            prisma.storeRequisitionItem.update({
              where: { id: reqItem.id },
              data: { quantityFulfilled: qFulfilled }
            })
          );
        }
      }

      await prisma.$transaction([
        ...updates,
        ...itemUpdates,
        prisma.storeRequisition.update({
          where: { id },
          data: { status }
        })
      ]);
    } else {
      await prisma.storeRequisition.update({
        where: { id },
        data: { status }
      });
    }

    return this.getById(id);
  }

  async delete(id: string) {
    return prisma.storeRequisition.delete({ where: { id } });
  }
}
