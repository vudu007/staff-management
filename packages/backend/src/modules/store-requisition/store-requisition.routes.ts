import { Router } from 'express';
import { StoreRequisitionService } from './store-requisition.service';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { auditLog } from '../../middleware/audit';

const router = Router();
const service = new StoreRequisitionService();

router.use(authenticate);

router.get('/', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const result = await service.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', requireRole('VIEWER'), async (req: AuthRequest, res) => {
  try {
    const result = await service.getById(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', requireRole('MANAGER'), auditLog({ action: 'CREATE', entityType: 'STORE_REQUISITION' }), async (req: AuthRequest, res) => {
  try {
    const result = await service.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id/status', requireRole('MANAGER'), auditLog({ action: 'UPDATE_STATUS', entityType: 'STORE_REQUISITION', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    const { status, fulfillmentData } = req.body;
    const result = await service.updateStatus(req.params.id, status, fulfillmentData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', requireRole('ADMIN'), auditLog({ action: 'DELETE', entityType: 'STORE_REQUISITION', entityIdField: 'id' }), async (req: AuthRequest, res) => {
  try {
    await service.delete(req.params.id);
    res.json({ success: true, message: 'Requisition deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
